"use client";

const particles = Array.from({ length: 18 }, (_, index) => ({
  id: index,
  left: `${(index * 37) % 100}%`,
  top: `${(index * 23) % 100}%`,
  delay: `${(index % 6) * 0.7}s`,
  duration: `${7 + (index % 5)}s`,
}));

export function ParticleField() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden opacity-40">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute h-1.5 w-1.5 rounded-full bg-cyan-200/60 shadow-[0_0_18px_rgba(103,232,249,0.8)]"
          style={{
            animation: `float-particle ${particle.duration} ease-in-out ${particle.delay} infinite alternate`,
            left: particle.left,
            top: particle.top,
          }}
        />
      ))}
    </div>
  );
}
