// CyberOpoly Card System

const CardData = {
    // Phishing Email cards (like Chance)
    phishingCards: [
        {
            title: "CEO Fraud",
            description: "You receive an email from the 'CEO' requesting an urgent wire transfer. It's a Business Email Compromise (BEC) attack!",
            effect: "PAY",
            amount: 150,
            education: "Business Email Compromise involves impersonating executives to trick employees into transferring money or revealing sensitive data. Always verify unusual requests through a separate communication channel."
        },
        {
            title: "Spear Phishing Success",
            description: "Your security awareness training helped an employee identify a targeted spear phishing attack. Crisis averted!",
            effect: "COLLECT",
            amount: 50,
            education: "Spear phishing uses personalized information to target specific individuals. Regular security training significantly reduces the success rate of these attacks."
        },
        {
            title: "Credential Harvesting",
            description: "An employee clicked a fake login page. Attackers stole credentials for multiple systems.",
            effect: "PAY",
            amount: 100,
            education: "Credential harvesting uses fake login pages to steal usernames and passwords. Multi-factor authentication prevents attackers from using stolen credentials."
        },
        {
            title: "Ransomware Email",
            description: "A user opened a malicious attachment containing ransomware. Your backups saved you, but recovery costs money.",
            effect: "PAY",
            amount: 200,
            education: "Ransomware encrypts files and demands payment. Regular, offline backups are the best defense. Never pay the ransom - it funds criminal operations and doesn't guarantee data recovery."
        },
        {
            title: "Security Awareness Win",
            description: "Your team reported 50 phishing attempts this quarter. Each player collects £25 from bug bounty fund.",
            effect: "COLLECT_FROM_ALL",
            amount: 25,
            education: "Creating a culture of security where employees feel comfortable reporting suspicious emails is one of the most effective defenses against phishing."
        },
        {
            title: "Watering Hole Attack",
            description: "A legitimate website your employees frequently visit was compromised and served malware.",
            effect: "PAY",
            amount: 75,
            education: "Watering hole attacks compromise websites that target groups frequently visit, then infect visitors. Keeping software updated and using web filtering helps prevent these attacks."
        },
        {
            title: "Smishing Attack",
            description: "SMS phishing message tricked an employee into revealing 2FA codes. Your session was hijacked!",
            effect: "PAY",
            amount: 125,
            education: "Smishing (SMS phishing) is increasingly common. Never share 2FA codes via SMS or over the phone. Use app-based authenticators when possible."
        },
        {
            title: "Email Filtering Success",
            description: "Your new email security gateway blocked 10,000 phishing attempts this month!",
            effect: "COLLECT",
            amount: 100,
            education: "Email security gateways use AI and threat intelligence to identify and block phishing emails before they reach users' inboxes."
        },
        {
            title: "Typosquatting Domain",
            description: "Attackers registered a domain similar to yours and are phishing your customers. Legal fees to shut it down.",
            effect: "PAY",
            amount: 80,
            education: "Typosquatting involves registering domains similar to legitimate ones. Proactively register common misspellings of your domain to prevent this."
        },
        {
            title: "Phishing Simulation",
            description: "Your quarterly phishing simulation identified vulnerable users. Training costs money but prevents breaches!",
            effect: "PAY",
            amount: 50,
            education: "Simulated phishing campaigns help identify users who need additional training and measure the effectiveness of awareness programs."
        },
        {
            title: "Advance to Payment Processor",
            description: "Attackers are targeting payment systems. Move directly to Payment Processor.",
            effect: "MOVE_TO",
            target: 26,
            education: "Payment systems are high-value targets. They must comply with PCI-DSS and implement strong authentication, encryption, and monitoring."
        },
        {
            title: "Advance to GO",
            description: "Your incident response was so fast, the attack was stopped before any damage. Return to SOC and collect £200!",
            effect: "MOVE_TO",
            target: 0,
            education: "Rapid incident response can minimize damage. The first hours of a breach are critical for containment."
        },
        {
            title: "Go Back 3 Spaces",
            description: "Zero-day exploit discovered in your infrastructure. Roll back to previous secure state.",
            effect: "MOVE_BACK",
            spaces: 3,
            education: "Zero-day exploits target previously unknown vulnerabilities. Defense in depth and monitoring for anomalous behavior help detect these attacks."
        },
        {
            title: "Vendor Compromise",
            description: "A third-party vendor was breached, compromising your data through the supply chain.",
            effect: "PAY_PER_PROPERTY",
            costPerHouse: 25,
            costPerHotel: 100,
            education: "Supply chain attacks exploit trusted relationships. Assess vendor security practices and limit their access to only what's necessary."
        },
        {
            title: "Security Conference",
            description: "You attended DEF CON and learned new defensive techniques. Advance to nearest Security Tool property.",
            effect: "MOVE_TO_TYPE",
            targetType: "green",
            education: "Security conferences provide valuable knowledge sharing. Attending helps security teams stay current on threats and defense techniques."
        },
        {
            title: "Dark Web Monitoring",
            description: "Your credentials were found for sale on the dark web. All players must immediately change passwords (pay £15 each to you).",
            effect: "COLLECT_FROM_ALL",
            amount: 15,
            education: "Dark web monitoring services alert you when your data appears in criminal marketplaces, allowing you to take protective action."
        }
    ],

    // Security Audit cards (like Community Chest)
    auditCards: [
        {
            title: "ISO 27001 Certification",
            description: "Congratulations! You achieved ISO 27001 certification. Collect £200.",
            effect: "COLLECT",
            amount: 200,
            education: "ISO 27001 is an international standard for information security management. Certification demonstrates commitment to security best practices."
        },
        {
            title: "SOC 2 Audit Passed",
            description: "Your SOC 2 Type II audit was successful. Customers have renewed contracts. Collect £150.",
            effect: "COLLECT",
            amount: 150,
            education: "SOC 2 audits verify that service providers have appropriate controls to protect customer data. Type II audits test controls over time."
        },
        {
            title: "PCI-DSS Violation",
            description: "Payment card data was stored in plain text. Pay £250 fine and remediation costs.",
            effect: "PAY",
            amount: 250,
            education: "PCI-DSS requires encryption of cardholder data at rest and in transit. Violations result in fines and potential loss of payment processing privileges."
        },
        {
            title: "GDPR Data Subject Request",
            description: "Processing data subject access requests costs time and money. Pay £50.",
            effect: "PAY",
            amount: 50,
            education: "GDPR gives individuals rights over their personal data including access, rectification, erasure, and portability. Organizations must respond within 30 days."
        },
        {
            title: "Bug Bounty Payout",
            description: "An ethical hacker found a critical vulnerability through your bug bounty program. Pay £100 bounty.",
            effect: "PAY",
            amount: 100,
            education: "Bug bounty programs incentivize ethical disclosure. Paying bounties is cheaper than suffering breaches and helps build positive security researcher relationships."
        },
        {
            title: "Vulnerability Disclosure",
            description: "You responsibly disclosed a vulnerability in open-source software. The community rewards you £75.",
            effect: "COLLECT",
            amount: 75,
            education: "Responsible disclosure involves notifying vendors of vulnerabilities before public release, giving them time to patch. This protects users and builds trust."
        },
        {
            title: "Insurance Premium",
            description: "Cyber insurance policy renewal. Pay £50 premium.",
            effect: "PAY",
            amount: 50,
            education: "Cyber insurance helps cover costs of breaches including forensics, legal fees, and customer notifications. Premiums are based on security posture and risk."
        },
        {
            title: "Password Audit Fail",
            description: "Audit revealed 40% of users had weak passwords. Enforcing password policy costs £40.",
            effect: "PAY",
            amount: 40,
            education: "Weak passwords are easily cracked. Strong password policies include length requirements, complexity, and regular changes. Passphrases are even better."
        },
        {
            title: "Penetration Test Success",
            description: "Your pentester found no critical vulnerabilities! Collect £100 for good security hygiene.",
            effect: "COLLECT",
            amount: 100,
            education: "Penetration testing simulates real attacks to find vulnerabilities. Regular testing helps maintain strong security posture."
        },
        {
            title: "Security Training Day",
            description: "Mandatory annual security training for all employees. Pay £10 per property you own.",
            effect: "PAY_PER_PROPERTY",
            amount: 10,
            education: "Regular security training keeps employees aware of current threats. Training should be engaging and include simulated phishing exercises."
        },
        {
            title: "Compliance Audit Season",
            description: "Multiple compliance audits this quarter. Pay £150 for audit preparation and remediation.",
            effect: "PAY",
            amount: 150,
            education: "Different industries have different compliance requirements (HIPAA, PCI-DSS, GDPR, etc.). Maintain continuous compliance rather than scrambling before audits."
        },
        {
            title: "Security Awareness Month",
            description: "October is Cybersecurity Awareness Month. Every player receives security training. Collect £10 from each player.",
            effect: "COLLECT_FROM_ALL",
            amount: 10,
            education: "Cybersecurity Awareness Month promotes security education. Simple measures like MFA, password managers, and software updates significantly improve security."
        },
        {
            title: "Threat Hunting Discovery",
            description: "Proactive threat hunting found an APT lurking in your network for 3 months. Pay £200 to remediate.",
            effect: "PAY",
            amount: 200,
            education: "Advanced Persistent Threats (APTs) are sophisticated attackers who remain hidden for months. Proactive threat hunting helps find them before they steal data."
        },
        {
            title: "Incident Response Retainer",
            description: "Annual retainer for incident response firm. Pay £75.",
            effect: "PAY",
            amount: 75,
            education: "Having an IR firm on retainer provides immediate access to experts during a breach, reducing response time and damage."
        },
        {
            title: "Security Champions Program",
            description: "Your security champions program improved security across all teams. Collect £50 from the bank.",
            effect: "COLLECT",
            amount: 50,
            education: "Security champions are developers/staff who receive extra security training and promote security practices in their teams."
        },
        {
            title: "Birthday Bonus",
            description: "It's Data Privacy Day! Collect £10 from every player.",
            effect: "COLLECT_FROM_ALL",
            amount: 10,
            education: "Data Privacy Day (January 28) commemorates the signing of Convention 108, the first international treaty on data protection."
        }
    ]
};

// Card Manager Class
class CardManager {
    constructor() {
        this.phishingDeck = this.shuffleDeck([...CardData.phishingCards]);
        this.auditDeck = this.shuffleDeck([...CardData.auditCards]);
        this.phishingDiscard = [];
        this.auditDiscard = [];
    }

    shuffleDeck(deck) {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
        return deck;
    }

    drawPhishingCard() {
        if (this.phishingDeck.length === 0) {
            this.phishingDeck = this.shuffleDeck(this.phishingDiscard);
            this.phishingDiscard = [];
        }
        const card = this.phishingDeck.pop();
        this.phishingDiscard.push(card);
        return card;
    }

    drawAuditCard() {
        if (this.auditDeck.length === 0) {
            this.auditDeck = this.shuffleDeck(this.auditDiscard);
            this.auditDiscard = [];
        }
        const card = this.auditDeck.pop();
        this.auditDiscard.push(card);
        return card;
    }

    executeCard(card, game, player) {
        const effect = card.effect;

        switch(effect) {
            case 'PAY':
                player.money -= card.amount;
                game.log(`${player.name} pays £${card.amount} to the bank`, true);
                break;

            case 'COLLECT':
                player.money += card.amount;
                game.log(`${player.name} collects £${card.amount} from the bank`, true);
                break;

            case 'COLLECT_FROM_ALL':
                let totalCollected = 0;
                game.players.forEach(p => {
                    if (p !== player) {
                        p.money -= card.amount;
                        totalCollected += card.amount;
                    }
                });
                player.money += totalCollected;
                game.log(`${player.name} collects £${card.amount} from each player (£${totalCollected} total)`, true);
                break;

            case 'PAY_PER_PROPERTY':
                let totalCost = 0;
                if (card.amount) {
                    totalCost = player.properties.length * card.amount;
                } else {
                    player.properties.forEach(propId => {
                        const space = game.board.getSpace(propId);
                        if (space.houses) totalCost += space.houses * (card.costPerHouse || 0);
                        if (space.hotel) totalCost += (card.costPerHotel || 0);
                    });
                }
                player.money -= totalCost;
                game.log(`${player.name} pays £${totalCost} (based on properties owned)`, true);
                break;

            case 'MOVE_TO':
                const oldPosition = player.position;
                player.position = card.target;
                if (card.target < oldPosition) {
                    // Passed GO
                    player.money += GameData.GO_BONUS;
                    game.log(`${player.name} passed GO and collected £${GameData.GO_BONUS}`);
                }
                game.log(`${player.name} moves to ${game.board.getSpace(card.target).name}`, true);
                game.landOnSpace(player);
                break;

            case 'MOVE_BACK':
                player.position = Math.max(0, player.position - card.spaces);
                game.log(`${player.name} moves back ${card.spaces} spaces to ${game.board.getSpace(player.position).name}`, true);
                game.landOnSpace(player);
                break;

            case 'MOVE_TO_TYPE':
                // Find nearest property of target type
                const nearestSpace = game.board.findNearestSpaceOfGroup(player.position, card.targetType);
                if (nearestSpace !== -1) {
                    const oldPos = player.position;
                    player.position = nearestSpace;
                    if (nearestSpace < oldPos) {
                        player.money += GameData.GO_BONUS;
                        game.log(`${player.name} passed GO and collected £${GameData.GO_BONUS}`);
                    }
                    game.log(`${player.name} moves to ${game.board.getSpace(nearestSpace).name}`, true);
                    game.landOnSpace(player);
                }
                break;
        }

        return card;
    }
}
