import CampusLogo from '../assets/campus-logo.jpeg';

export default function CampusLogoIcon({ className = '' }) {
  return (
    <img
      src={CampusLogo}
      alt="Campus Navigator logo"
      className={`h-full w-full object-contain ${className}`}
    />
  );
}
