const ambientStars = Array.from({ length: 42 }, (_, index) => ({
  id: `ambient-${index}`,
  left: `${(index * 17) % 100}%`,
  top: `${(index * 23 + 7) % 100}%`,
  size: `${index % 5 === 0 ? 3 : index % 3 === 0 ? 2 : 1.5}px`,
  duration: `${3 + (index % 4) * 1.4}s`,
  delay: `${(index % 7) * 0.6}s`,
  opacity: 0.28 + (index % 4) * 0.12,
}));

const shootingStars = [
  { id: "shoot-1", top: "12%", left: "10%", delay: "0s", duration: "8s" },
  { id: "shoot-2", top: "22%", left: "62%", delay: "2.6s", duration: "9s" },
  { id: "shoot-3", top: "58%", left: "18%", delay: "4.4s", duration: "8.5s" },
  { id: "shoot-4", top: "70%", left: "68%", delay: "6.2s", duration: "10s" },
];

const ProfileStarfield = () => {
  return (
    <div aria-hidden="true" className="profile-starfield">
      <div className="profile-nebula profile-nebula-left" />
      <div className="profile-nebula profile-nebula-right" />

      {ambientStars.map((star) => (
        <span
          key={star.id}
          className="profile-star"
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animationDuration: star.duration,
            animationDelay: star.delay,
          }}
        />
      ))}

      {shootingStars.map((star) => (
        <span
          key={star.id}
          className="profile-shooting-star"
          style={{
            left: star.left,
            top: star.top,
            animationDelay: star.delay,
            animationDuration: star.duration,
          }}
        />
      ))}
    </div>
  );
};

export default ProfileStarfield;
