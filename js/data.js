// CyberOpoly Game Data

const GameData = {
    // Starting money for each player
    STARTING_MONEY: 1500,

    // Pass GO bonus
    GO_BONUS: 200,

    // Player token options
    tokens: [
        { id: 'shield', icon: '🛡️', name: 'Shield' },
        { id: 'lock', icon: '🔒', name: 'Lock' },
        { id: 'key', icon: '🔑', name: 'Key' },
        { id: 'bug', icon: '🐛', name: 'Bug' },
        { id: 'hacker', icon: '👤', name: 'Hacker' },
        { id: 'terminal', icon: '💻', name: 'Terminal' },
        { id: 'server', icon: '🖥️', name: 'Server' },
        { id: 'firewall', icon: '🔥', name: 'Firewall' },
        { id: 'skull', icon: '💀', name: 'Skull' },
        { id: 'robot', icon: '🤖', name: 'Robot' },
        { id: 'satellite', icon: '📡', name: 'Satellite' },
        { id: 'chip', icon: '🔌', name: 'Chip' }
    ],

    // Board spaces (40 total, like Monopoly)
    spaces: [
        // Bottom row (right to left)
        {
            id: 0,
            name: "Security Operations Center",
            type: "go",
            description: "Your central command for all security operations. Collect £200 salary every time you pass.",
            action: "Collect £200"
        },
        {
            id: 1,
            name: "Old Database",
            type: "property",
            group: "brown",
            price: 60,
            rent: [2, 10, 30, 90, 160, 250],
            upgradeCost: 50,
            mortgage: 30,
            description: "A legacy database system running outdated software. High risk, low cost. Common vulnerabilities include SQL injection and unpatched security flaws.",
            education: "Legacy systems often lack modern security features and may not receive regular updates, making them prime targets for attackers."
        },
        {
            id: 2,
            name: "Security Audit",
            type: "audit",
            description: "Time for a security review! Draw an audit card."
        },
        {
            id: 3,
            name: "Mainframe",
            type: "property",
            group: "brown",
            price: 60,
            rent: [4, 20, 60, 180, 320, 450],
            upgradeCost: 50,
            mortgage: 30,
            description: "Ancient mainframe computer still processing critical data. Requires specialized knowledge to secure properly.",
            education: "Mainframes are powerful but aging systems. Many organizations still depend on them, but finding security experts who understand them is increasingly difficult."
        },
        {
            id: 4,
            name: "Compliance Fine",
            type: "tax",
            amount: 200,
            description: "Failed to meet GDPR requirements. Pay £200 fine.",
            education: "Compliance failures can be costly. GDPR fines can reach up to £20 million or 4% of annual global turnover."
        },
        {
            id: 5,
            name: "SOC Team",
            type: "incident",
            price: 200,
            rent: [25, 50, 100, 200],
            mortgage: 100,
            description: "Security Operations Center team monitoring threats 24/7.",
            education: "SOC teams are the front line of defense, monitoring networks for suspicious activity and responding to security incidents in real-time."
        },
        {
            id: 6,
            name: "Employee Workstation",
            type: "property",
            group: "lightblue",
            price: 100,
            rent: [6, 30, 90, 270, 400, 550],
            upgradeCost: 50,
            mortgage: 50,
            description: "Standard desktop computer used by employees. Common attack vector through phishing and malware.",
            education: "Employee workstations are frequently targeted because users may click malicious links, download infected files, or use weak passwords."
        },
        {
            id: 7,
            name: "Phishing Email",
            type: "phishing",
            description: "You've received a suspicious email. Draw a phishing card."
        },
        {
            id: 8,
            name: "Mobile Devices",
            type: "property",
            group: "lightblue",
            price: 100,
            rent: [6, 30, 90, 270, 400, 550],
            upgradeCost: 50,
            mortgage: 50,
            description: "Company smartphones and tablets used for work. BYOD policies create security challenges.",
            education: "Mobile devices expand the attack surface. Lost or stolen devices, unsecured Wi-Fi connections, and malicious apps pose significant risks."
        },
        {
            id: 9,
            name: "Laptop Fleet",
            type: "property",
            group: "lightblue",
            price: 120,
            rent: [8, 40, 100, 300, 450, 600],
            upgradeCost: 50,
            mortgage: 60,
            description: "Portable computers used by remote workers. Remote work increases security complexity.",
            education: "Laptops are particularly vulnerable when used outside the corporate network. Full disk encryption and VPNs are essential security controls."
        },
        {
            id: 10,
            name: "Quarantine",
            type: "jail",
            description: "Your system has been isolated due to malware infection. You're in quarantine.",
            education: "Quarantine (network isolation) is a critical incident response technique to prevent malware from spreading to other systems."
        },
        // Left column (bottom to top)
        {
            id: 11,
            name: "Corporate Website",
            type: "property",
            group: "pink",
            price: 140,
            rent: [10, 50, 150, 450, 625, 750],
            upgradeCost: 100,
            mortgage: 70,
            description: "Public-facing website. Vulnerable to XSS, CSRF, and DDoS attacks.",
            education: "Web applications are common targets. Cross-Site Scripting (XSS) and Cross-Site Request Forgery (CSRF) are frequent vulnerabilities."
        },
        {
            id: 12,
            name: "Certificate Authority",
            type: "utility",
            price: 150,
            mortgage: 75,
            description: "Issues and manages SSL/TLS certificates for secure communications.",
            education: "Certificate Authorities validate identities and enable encrypted connections. Compromised CAs can undermine the entire PKI trust model."
        },
        {
            id: 13,
            name: "API Gateway",
            type: "property",
            group: "pink",
            price: 140,
            rent: [10, 50, 150, 450, 625, 750],
            upgradeCost: 100,
            mortgage: 70,
            description: "Central access point for application APIs. Must defend against injection attacks and API abuse.",
            education: "APIs are increasingly targeted. Proper authentication, rate limiting, and input validation are essential to prevent abuse and data breaches."
        },
        {
            id: 14,
            name: "Web Portal",
            type: "property",
            group: "pink",
            price: 160,
            rent: [12, 60, 180, 500, 700, 900],
            upgradeCost: 100,
            mortgage: 80,
            description: "Customer-facing web portal with login functionality. Authentication bypass is a common attack.",
            education: "Web portals handle sensitive user data and authentication. Multi-factor authentication (MFA) significantly reduces account takeover risks."
        },
        {
            id: 15,
            name: "Forensics Lab",
            type: "incident",
            price: 200,
            rent: [25, 50, 100, 200],
            mortgage: 100,
            description: "Digital forensics team for incident investigation and evidence collection.",
            education: "Forensics experts analyze breaches to understand attack methods, scope of compromise, and help with prosecution of cybercriminals."
        },
        {
            id: 16,
            name: "Network Router",
            type: "property",
            group: "orange",
            price: 180,
            rent: [14, 70, 200, 550, 750, 950],
            upgradeCost: 100,
            mortgage: 90,
            description: "Core network device routing traffic. Can be exploited to intercept or redirect network traffic.",
            education: "Routers are critical infrastructure. Hardening includes changing default credentials, disabling unnecessary services, and applying firmware updates."
        },
        {
            id: 17,
            name: "Security Audit",
            type: "audit",
            description: "Compliance check! Draw an audit card."
        },
        {
            id: 18,
            name: "Network Switch",
            type: "property",
            group: "orange",
            price: 180,
            rent: [14, 70, 200, 550, 750, 950],
            upgradeCost: 100,
            mortgage: 90,
            description: "Manages network traffic between devices. Can be targeted for ARP spoofing and MAC flooding attacks.",
            education: "Layer 2 attacks like ARP spoofing can allow attackers to intercept traffic. Port security and DHCP snooping help mitigate these risks."
        },
        {
            id: 19,
            name: "Load Balancer",
            type: "property",
            group: "orange",
            price: 200,
            rent: [16, 80, 220, 600, 800, 1000],
            upgradeCost: 100,
            mortgage: 100,
            description: "Distributes traffic across multiple servers. Single point of failure if compromised.",
            education: "Load balancers improve availability but become attractive targets. DDoS protection and SSL offloading are common security features."
        },
        {
            id: 20,
            name: "Bug Bounty Payout",
            type: "parking",
            description: "Ethical hackers reported vulnerabilities! Collect any pending bug bounty payments.",
            education: "Bug bounty programs incentivize security researchers to responsibly disclose vulnerabilities instead of selling them to criminals."
        },
        // Top row (left to right)
        {
            id: 21,
            name: "AWS Instance",
            type: "property",
            group: "red",
            price: 220,
            rent: [18, 90, 250, 700, 875, 1050],
            upgradeCost: 150,
            mortgage: 110,
            description: "Cloud virtual machine. Misconfigured IAM policies and exposed S3 buckets are common issues.",
            education: "Cloud misconfigurations are a leading cause of breaches. The shared responsibility model means customers must secure their own data and applications."
        },
        {
            id: 22,
            name: "Phishing Email",
            type: "phishing",
            description: "Suspicious attachment detected! Draw a phishing card."
        },
        {
            id: 23,
            name: "Azure VM",
            type: "property",
            group: "red",
            price: 220,
            rent: [18, 90, 250, 700, 875, 1050],
            upgradeCost: 150,
            mortgage: 110,
            description: "Microsoft Azure virtual machine. Requires proper network security groups and identity management.",
            education: "Azure Active Directory is a prime target. Conditional access policies and privileged identity management help protect cloud resources."
        },
        {
            id: 24,
            name: "Cloud Storage",
            type: "property",
            group: "red",
            price: 240,
            rent: [20, 100, 300, 750, 925, 1100],
            upgradeCost: 150,
            mortgage: 120,
            description: "Cloud-based file storage. Data breaches often result from publicly accessible buckets.",
            education: "Cloud storage breaches exposing millions of records make headlines regularly. Always use encryption at rest and in transit, and audit access permissions."
        },
        {
            id: 25,
            name: "Threat Intelligence",
            type: "incident",
            price: 200,
            rent: [25, 50, 100, 200],
            mortgage: 100,
            description: "Threat intelligence feeds providing early warning of emerging threats.",
            education: "Threat intelligence helps organizations proactively defend against known attack patterns, malware signatures, and adversary tactics."
        },
        {
            id: 26,
            name: "Payment Processor",
            type: "property",
            group: "yellow",
            price: 260,
            rent: [22, 110, 330, 800, 975, 1150],
            upgradeCost: 150,
            mortgage: 130,
            description: "Handles credit card transactions. Must comply with PCI-DSS standards.",
            education: "Payment Card Industry Data Security Standard (PCI-DSS) requires strict controls. Non-compliance can result in fines and loss of payment processing ability."
        },
        {
            id: 27,
            name: "Authentication Server",
            type: "property",
            group: "yellow",
            price: 260,
            rent: [22, 110, 330, 800, 975, 1150],
            upgradeCost: 150,
            mortgage: 130,
            description: "Central authentication system. Compromise grants access to multiple systems.",
            education: "Authentication servers are high-value targets. Password spraying, credential stuffing, and brute force attacks are common. MFA is critical."
        },
        {
            id: 28,
            name: "Identity Provider",
            type: "utility",
            price: 150,
            mortgage: 75,
            description: "Single Sign-On (SSO) system managing user identities across applications.",
            education: "SSO improves user experience but creates a single point of failure. Compromising an identity provider can grant access to all connected applications."
        },
        {
            id: 29,
            name: "Database Cluster",
            type: "property",
            group: "yellow",
            price: 280,
            rent: [24, 120, 360, 850, 1025, 1200],
            upgradeCost: 150,
            mortgage: 140,
            description: "Production database containing critical business data. Prime target for data exfiltration.",
            education: "Databases contain valuable data. SQL injection, privilege escalation, and stolen credentials are common attack vectors. Encryption and access logging are essential."
        },
        {
            id: 30,
            name: "Go to Quarantine",
            type: "go-to-jail",
            description: "Ransomware detected! Go directly to Quarantine. Do not pass GO. Do not collect £200.",
            education: "Ransomware encrypts files and demands payment. Prevention includes regular backups, email filtering, and endpoint protection."
        },
        // Right column (top to bottom)
        {
            id: 31,
            name: "SIEM System",
            type: "property",
            group: "green",
            price: 300,
            rent: [26, 130, 390, 900, 1100, 1275],
            upgradeCost: 200,
            mortgage: 150,
            description: "Security Information and Event Management system. Central logging and correlation of security events.",
            education: "SIEM systems aggregate logs from across the infrastructure to detect patterns indicating attacks. Key for compliance and incident response."
        },
        {
            id: 32,
            name: "IDS/IPS",
            type: "property",
            group: "green",
            price: 300,
            rent: [26, 130, 390, 900, 1100, 1275],
            upgradeCost: 200,
            mortgage: 150,
            description: "Intrusion Detection and Prevention System. Monitors network traffic for suspicious activity.",
            education: "IDS detects threats; IPS actively blocks them. Signature-based detection catches known attacks; anomaly-based detection finds new ones."
        },
        {
            id: 33,
            name: "Security Audit",
            type: "audit",
            description: "Penetration test results are in! Draw an audit card."
        },
        {
            id: 34,
            name: "Next-Gen Firewall",
            type: "property",
            group: "green",
            price: 320,
            rent: [28, 150, 450, 1000, 1200, 1400],
            upgradeCost: 200,
            mortgage: 160,
            description: "Advanced firewall with deep packet inspection and application awareness.",
            education: "Next-generation firewalls go beyond port/protocol filtering to inspect application-layer traffic, detect malware, and prevent intrusions."
        },
        {
            id: 35,
            name: "Red Team",
            type: "incident",
            price: 200,
            rent: [25, 50, 100, 200],
            mortgage: 100,
            description: "Offensive security team simulating real-world attacks to find vulnerabilities.",
            education: "Red teams think like attackers to test defenses. They use the same tools and techniques as real adversaries to identify weaknesses."
        },
        {
            id: 36,
            name: "Phishing Email",
            type: "phishing",
            description: "CEO fraud attempt detected! Draw a phishing card."
        },
        {
            id: 37,
            name: "Intellectual Property",
            type: "property",
            group: "darkblue",
            price: 350,
            rent: [35, 175, 500, 1100, 1300, 1500],
            upgradeCost: 200,
            mortgage: 175,
            description: "Proprietary source code and trade secrets. Primary target for nation-state actors and competitors.",
            education: "IP theft can destroy competitive advantage. Advanced Persistent Threats (APTs) often spend months inside networks stealing intellectual property."
        },
        {
            id: 38,
            name: "Data Breach Tax",
            type: "tax",
            amount: 100,
            description: "Data breach notification costs. Pay £100 for customer notifications and credit monitoring.",
            education: "Data breach costs include forensics, legal fees, notifications, credit monitoring, regulatory fines, and reputation damage. Average cost per record varies by industry."
        },
        {
            id: 39,
            name: "Customer Database",
            type: "property",
            group: "darkblue",
            price: 400,
            rent: [50, 200, 600, 1400, 1700, 2000],
            upgradeCost: 200,
            mortgage: 200,
            description: "Sensitive customer data including PII. Most valuable target for attackers. Breach has severe consequences.",
            education: "Personal Identifiable Information (PII) is extremely valuable on the dark web. Protecting customer data is both a legal obligation and ethical imperative."
        }
    ],

    // Property groups for monopoly logic
    propertyGroups: {
        brown: [1, 3],
        lightblue: [6, 8, 9],
        pink: [11, 13, 14],
        orange: [16, 18, 19],
        red: [21, 23, 24],
        yellow: [26, 27, 29],
        green: [31, 32, 34],
        darkblue: [37, 39]
    },

    incidentGroups: [5, 15, 25, 35],
    utilityGroups: [12, 28]
};
