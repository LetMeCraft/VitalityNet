import pickle as pkl
import os
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
from db import (
    fetch_prediction_history,
    get_storage_status,
    save_contact_message,
    save_prediction,
)

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

FEATURE_COLUMNS = [
    "Pregnancies",
    "Glucose",
    "BloodPressure",
    "SkinThickness",
    "Insulin",
    "BMI",
    "DiabetesPedigreeFunction",
    "Age",
]

script_dir = os.path.dirname(os.path.abspath(__file__))
scaler_path = os.path.join(script_dir, 'scaler.pkl')
scaler = pkl.load(open(scaler_path, 'rb'))

file_path = os.path.join(script_dir, 'nb.pkl')
with open(file_path, 'rb') as f:
    model = pkl.load(f)

def predict(features):
    input_data = pd.DataFrame(
        [[features[column] for column in FEATURE_COLUMNS]],
        columns=FEATURE_COLUMNS,
    )
    input_data = scaler.transform(input_data)
    prediction = model.predict(input_data)

    if int(prediction[0]) == 1:
        result = {
            'result': "High Risk",
            'prediction': "You have high chances of Diabetes! Please consult a Doctor",
            'gif_url': "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOTZlY2pwcDNtcnNhc2JwdDk4YnVqenRpcXl0OXFxdWRya3U0dmZ4aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o6wrebnKWmvx4ZBio/giphy.gif"
        }
    else:
        result = {
            'result': "Low Risk",
            'prediction': "You have low chances of Diabetes. Please maintain a healthy life style",
            'gif_url': "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExd2txb242N3pkMmp0ODRiangydm9raDY5OHBhYmw1Y2NobjM0cGZtNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/W1GG6RYUcWxoHl3jV9/giphy.gif"
        }

    return result

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'storage': get_storage_status(),
    })

@app.route('/predictions/history', methods=['GET'])
def prediction_history():
    try:
        limit = int(request.args.get('limit', 10))
    except ValueError:
        return jsonify({'error': 'limit must be an integer value.'}), 400

    limit = min(max(limit, 1), 50)
    user_id = request.args.get('userId') or None
    user_email = request.args.get('userEmail') or None

    return jsonify({
        'history': fetch_prediction_history(
            limit,
            user_id=user_id,
            user_email=user_email,
        ),
        'storage': get_storage_status(),
    })

@app.route('/predict', methods=['POST'])
def predictions():
    data = request.get_json(silent=True) or {}
    dpf_value = data.get('DiabetesPedigreeFunction', data.get('DPF'))

    required_fields = [
        'Age',
        'Pregnancies',
        'Glucose',
        'BloodPressure',
        'Insulin',
        'BMI',
        'SkinThickness',
    ]
    missing_fields = [field for field in required_fields if data.get(field) in (None, "")]
    if dpf_value in (None, ""):
        missing_fields.append('DiabetesPedigreeFunction')

    if missing_fields:
        return jsonify({
            'error': 'Missing required fields',
            'missing_fields': missing_fields,
        }), 400

    try:
        features = {
            'Pregnancies': float(data['Pregnancies']),
            'Glucose': float(data['Glucose']),
            'BloodPressure': float(data['BloodPressure']),
            'SkinThickness': float(data['SkinThickness']),
            'Insulin': float(data['Insulin']),
            'BMI': float(data['BMI']),
            'DiabetesPedigreeFunction': float(dpf_value),
            'Age': float(data['Age']),
        }
    except (TypeError, ValueError):
        return jsonify({
            'error': 'All fields must be numeric values.',
        }), 400

    result = predict(features)

    metadata = {}
    if data.get('userId'):
        metadata['userId'] = data['userId']
    if data.get('userEmail'):
        metadata['userEmail'] = data['userEmail']
    if data.get('clientPredictionId'):
        metadata['clientPredictionId'] = data['clientPredictionId']

    try:
        save_prediction(features, result, metadata or None)
    except Exception as exc:
        app.logger.warning("Prediction could not be saved to MongoDB: %s", exc)

    return jsonify(result)


@app.route('/contact', methods=['POST'])
def contact():
    data = request.get_json(silent=True) or {}

    name = (data.get('name') or '').strip()
    email = (data.get('email') or '').strip()
    message = (data.get('message') or '').strip()

    missing_fields = []
    if not name:
        missing_fields.append('name')
    if not email:
        missing_fields.append('email')
    if not message:
        missing_fields.append('message')

    if missing_fields:
        return jsonify({
            'error': 'Missing required fields.',
            'missing_fields': missing_fields,
        }), 400

    if '@' not in email or '.' not in email.split('@')[-1]:
        return jsonify({
            'error': 'Please enter a valid email address.',
        }), 400

    metadata = {
        'source': 'contact-form',
        'ipAddress': request.headers.get('X-Forwarded-For', request.remote_addr),
        'userAgent': request.headers.get('User-Agent'),
    }

    try:
        inserted_id = save_contact_message(name, email, message, metadata)
    except Exception as exc:
        app.logger.warning("Contact message could not be saved to MongoDB: %s", exc)
        return jsonify({
            'error': 'We could not save your message right now.',
        }), 500

    if not inserted_id:
        return jsonify({
            'error': 'MongoDB storage is not configured on the backend.',
        }), 503

    return jsonify({
        'message': 'Contact message saved successfully.',
        'id': inserted_id,
    }), 201

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)
