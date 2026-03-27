import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import {
  auth,
  firebaseMissingKeys,
  googleProvider,
  isFirebaseConfigured,
} from "../lib/firebase";

const AuthContext = createContext(null);

const getFirebaseConfigError = () =>
  `Firebase auth is not configured yet. Add these keys to client/.env: ${firebaseMissingKeys.join(", ")}`;

const ensureFirebaseConfigured = () => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error(getFirebaseConfigError());
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const loginWithEmail = (email, password) => {
    ensureFirebaseConfigured();
    return signInWithEmailAndPassword(auth, email, password);
  };

  const signupWithEmail = async (name, email, password) => {
    ensureFirebaseConfigured();
    const credentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    if (name.trim()) {
      await updateProfile(credentials.user, { displayName: name.trim() });
    }

    return credentials;
  };

  const loginWithGoogle = () => {
    ensureFirebaseConfigured();
    return signInWithPopup(auth, googleProvider);
  };

  const logout = async () => {
    ensureFirebaseConfigured();
    await signOut(auth);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isFirebaseConfigured,
        firebaseMissingKeys,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider.");
  }

  return context;
};
