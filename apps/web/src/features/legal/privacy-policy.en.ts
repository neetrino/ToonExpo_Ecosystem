import type { PrivacyPolicyCopy } from '@/features/legal/privacy-policy.types';

export const PRIVACY_POLICY_EN: PrivacyPolicyCopy = {
  title: 'Privacy Policy',
  intro: [
    'This Privacy Policy describes how TOON EXPO collects, uses, and stores users’ personal data through our website and mobile application.',
    'This Privacy Policy describes how TOON EXPO (organized by Big Projects LLC) collects, uses, and stores users’ personal data through our website (toonexpo.com) and mobile application. By participating in TOON EXPO and providing the relevant confirmation in the electronic and/or paper form presented to you, you consent to the collection, processing, and transfer of your personal data as described in this Policy and agree that such data will be protected in accordance with the applicable data protection legislation of the Republic of Armenia.',
  ],
  sections: [
    {
      title: '1. Data We Collect',
      paragraphs: ['The personal information collected under this Policy includes:'],
      bullets: [
        {
          title: 'Personal and contact information.',
          body: 'First name, last name, email address, phone number, date of birth, country, city (provided by the user when completing application or registration forms).',
        },
        {
          title: 'Professional information.',
          body: 'Company/organization, job title/role, industry/sector.',
        },
        {
          title: 'Technical and application usage data.',
          body: 'IP addresses, device information, browser type, date and time of access, and data relating to interaction with the application (features used, session duration, preferences, accessed content, error logs).',
        },
        {
          title: 'Feedback data.',
          body: 'Information voluntarily provided through inquiries and feedback forms.',
        },
      ],
      note: 'Note: This Policy applies only to the toonexpo.com website and the TOON EXPO application. We are not responsible for third-party websites that users may access through links available on our platforms.',
    },
    {
      title: '2. Purpose of Data Collection',
      paragraphs: ['The collected data is processed for the following purposes:'],
      bullets: [
        {
          title: 'Event management.',
          body: 'Enabling registration, coordinating logistics, providing updates, and ensuring security.',
        },
        {
          title: 'Engagement optimization and personalization.',
          body: 'Improving the participation experience and providing personalized application features (for example, personalized schedules and networking tools).',
        },
        {
          title: 'Analytics.',
          body: 'Creating anonymous statistics in order to improve future events.',
        },
      ],
    },
    {
      title: '3. Legal Basis for Processing',
      paragraphs: ['We process your personal data on the following legal grounds:'],
      points: [
        {
          title: '3.1 Legitimate interests.',
          body: 'Ensuring the uninterrupted operation of TOON EXPO and improving the participant experience.',
        },
        {
          title: '3.2 Compliance with legal obligations.',
          body: 'We may process data in accordance with legislative or regulatory requirements, including the Law of the Republic of Armenia on Personal Data Protection.',
        },
      ],
    },
    {
      title: '4. Data Retention',
      paragraphs: [
        'We retain your personal data only for as long as necessary to fulfill the purposes stated in this Policy. Data that is no longer required is securely deleted or anonymized.',
      ],
    },
    {
      title: '5. Transfer of Personal Data',
      points: [
        {
          title: '5.1 Service providers.',
          body: 'We engage trusted third parties (IT service providers, payment processors, marketing service providers) that are required to maintain the confidentiality of the data.',
        },
        {
          title: '5.2 Legal compliance.',
          body: 'Data may be disclosed to law enforcement or regulatory authorities where required by law.',
        },
        {
          title: '5.3 Business transfers.',
          body: 'In the event of a merger or sale, data may be transferred to the new organization.',
        },
      ],
    },
    {
      title: '6. Your Rights',
      paragraphs: ['You have the following rights:'],
      bullets: [
        { title: 'Right of access to your data', body: '' },
        { title: 'Right to rectification', body: '' },
        { title: 'Right to deletion (destruction)', body: '' },
        { title: 'Right to restriction of processing', body: '' },
        { title: 'Right to withdraw consent', body: '' },
        {
          title: 'Right to request other actions related to the processing of your personal data',
          body: '',
        },
      ],
      trailing: [
        'To exercise these rights, please contact us using the contact information provided on the website or write to us at info@bigprojects.am. If a request for deletion (destruction) or withdrawal is submitted, your data will be deleted within 3 (three) business days after receipt of the request, without any adverse consequences.',
      ],
    },
    {
      title: '7. Changes to This Policy',
      paragraphs: [
        'We reserve the right to amend this Policy at any time. Material changes will be communicated through the website.',
      ],
    },
    {
      title: '8. Use of Cookies',
      paragraphs: [
        'We use cookies to improve the operation of the website, analyze usage trends, and personalize advertisements.',
      ],
    },
    {
      title: '9. Contact',
      paragraphs: [
        'If you have any questions regarding this Privacy Policy, you may contact:',
        'Big Projects LLC',
        'Address: 2/1 Sarmen Street, Yerevan, Republic of Armenia',
        'Email: info@bigprojects.am',
        'Phone: (+374) 44 533521',
      ],
    },
  ],
};
