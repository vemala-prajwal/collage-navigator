import emergencyContacts from '../lib/emergencyContacts';
import styles from '../pages/EmergencyContacts.module.css';

export default function EmergencyContacts() {
  return (
    <section className={styles.wrapper}>
      <h1 className={styles.title}>Emergency Contacts</h1>
      <p className={styles.subtitle}>Tap any number to call directly from your phone.</p>

      <div className={styles.grid}>
        {emergencyContacts.map((group) => (
          <div key={group.category} className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span className={styles.icon}>{group.icon}</span>
              {group.category}
            </h2>
            <ul className={styles.list}>
              {group.contacts.map((contact) => (
                <li key={`${group.category}-${contact.name}`} className={styles.listItem}>
                  <span className={styles.name}>{contact.name}</span>
                  <a href={`tel:${contact.number}`} className={styles.number}>
                    {contact.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
