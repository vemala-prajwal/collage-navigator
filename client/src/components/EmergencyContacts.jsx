import { PhoneCall } from 'lucide-react';
import emergencyContacts from '../lib/emergencyContacts';
import styles from '../pages/EmergencyContacts.module.css';

export default function EmergencyContacts() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <p className={styles.overline}>Emergency response</p>
        <h1 className={styles.title}>Campus emergency contacts</h1>
        <p className={styles.subtitle}>
          Tap any line to call instantly. Every contact uses direct
          <span className={styles.telLabel}> tel:</span> dialing.
        </p>
      </div>

      <div className={styles.grid}>
        {emergencyContacts.map((group) => (
          <article key={group.category} className={styles.card}>
            <div className={styles.cardHeader}>
              <span className={styles.icon}>{group.icon}</span>
              <div>
                <p className={styles.category}>{group.category}</p>
                <p className={styles.cardMeta}>Priority campus safety & support lines</p>
              </div>
            </div>

            <ul className={styles.list}>
              {group.contacts.map((contact) => (
                <li key={`${group.category}-${contact.name}`} className={styles.listItem}>
                  <div className={styles.contactInfo}>
                    <span className={styles.name}>{contact.name}</span>
                    <span className={styles.role}>Emergency contact</span>
                  </div>
                  <a
                    href={`tel:${contact.number}`}
                    className={styles.callButton}
                    aria-label={`Call ${contact.name} at ${contact.number}`}
                  >
                    <PhoneCall size={16} aria-hidden="true" />
                    <span>{contact.number}</span>
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
