# Configuration Schema for AI Portfolio + Interactive Assistant

This document defines the variables and data structures used to customize a personal portfolio website and embedded mascot AI assistant.

---

## 1. User & Professional Profile

```yaml
profile:
  full_name: "Mehran Khan"
  role_title: "Junior SOC Analyst"
  headline: "Building security operations pipelines, analyzing network threats, and automating alert triage in my home lab."
  location: "Lahore, Pakistan"
  availability: "Open to Junior SOC Analyst, L1 Security Operations roles (Remote / Hybrid)"
  career_direction: "SOC Analyst -> Detection Engineer -> Cloud Security"

education:
  degree: "BS Cyber Security"
  institution: "Leads University, Lahore"
  status: "1st semester, Active"
  academic_metric: "3.94 GPA"

certifications_and_learning:
  active_certifications: []
  in_progress:
    - name: "CompTIA Security+"
      status: "Studying for exam"
  platforms:
    - platform: "TryHackMe"
      url: "https://tryhackme.com/p/MehranKhan"

social_links:
  email: "mehrankhan171x@gmail.com"
  github: "https://github.com/mehran-sec"
  linkedin: "https://www.linkedin.com/in/mehran-khan-13171a3b6/"
  portfolio_url: "https://mehran-sec.github.io/"
  formspree_id: "mkjoovkj"
```

---

## 2. Projects & Technical Skills

```yaml
projects:
  featured:
    title: "AI-Augmented SOC Pipeline"
    tagline: "Autonomous Alert Enrichment & Triage Workflow"
    description: "An automated SOC workflow that ingests Wazuh SIEM alerts, enriches suspicious IPs with threat intelligence via AbuseIPDB and VirusTotal, calculates a composite risk score, uses Claude AI for contextual triage, and routes actionable alerts to Slack and Jira."
    pipeline_nodes:
      - label: "Wazuh"
        sub: "SIEM Alerts"
      - label: "n8n"
        sub: "Orchestration"
      - label: "Threat Intel"
        sub: "AbuseIPDB · VT"
      - label: "AI Triage"
        sub: "Claude API"
      - label: "Slack / Jira"
        sub: "Notifications"
    tags: ["Wazuh", "n8n", "Docker", "Linux", "Claude API", "VirusTotal", "AbuseIPDB", "Slack", "Jira"]
    repo_url: "https://github.com/mehran-sec/Ai_Augmented_SOC"

  secondary:
    - title: "Home Lab Environment"
      description: "Wazuh SIEM in Docker, Kali Linux, Ubuntu with Wazuh agent, Metasploitable, Nessus, and Windows Server on KVM/virt-manager."
      tags: ["Wazuh", "KVM", "Docker", "Kali", "Nessus"]
      repo_url: "https://github.com/mehran-sec/Wazuh-Detection-lab-"
    - title: "SSH Brute-Force Detection"
      description: "Custom Wazuh correlation rules for detecting SSH brute-force patterns."
      tags: ["Wazuh", "Detection Rules", "SSH", "Linux"]
      link_url: "writeups.html#ssh-bruteforce-detection"

skills:
  categories:
    - name: "SIEM & Detection"
      items: ["Wazuh", "Suricata", "Correlation Rules", "Custom Decoders", "Sysmon"]
    - name: "Network Analysis"
      items: ["Wireshark", "tcpdump", "PCAP Analysis", "Nessus"]
    - name: "Systems & Infrastructure"
      items: ["Linux (Ubuntu, Kali)", "Windows Server", "Docker", "KVM / virt-manager"]
    - name: "Automation & Scripting"
      items: ["n8n", "Python", "Bash", "REST API Integrations"]
```

---

## 3. Design Tokens & Mascot Configuration

```yaml
design:
  theme: "dark-minimal"
  colors:
    bg_primary: "#0B0B0F"
    bg_surface: "#14141A"
    bg_elevated: "#1C1C24"
    text_primary: "#EDEDEB"
    text_secondary: "#9B9B9B"
    text_muted: "#7C7C7C"
    accent: "#A8C66C"
    accent_hover: "#BDDA84"
    border: "#252530"
    danger: "#E55B5B"
  typography:
    sans: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    mono: "ui-monospace, 'JetBrains Mono', 'Fira Code', monospace"

mascot:
  type: "ghost" # ghost | robot | cat | orb
  theme_tokens:
    body: "#ffffff"
    outline: "#0b1020"
    hem: "#d9efff"
    blush: "rgba(168, 198, 108, 0.5)"
    shield: "#A8C66C"
  launcher_label: "✦ Ask Mehran AI"
  enable_speech_bubble: false # Set true to enable popups, false for silent emotion-only
  idle_sleep_seconds: 30
```

---

## 4. AI & Backend Configuration

```yaml
ai_service:
  provider: "gemini" # gemini | openai
  models:
    gemini_default: "gemini-3.5-flash-lite"
    openai_default: "gpt-4o-mini"
  endpoints:
    chat: "/chat"
    health: "/health"
  rate_limit:
    requests_per_minute: 10
  timeouts:
    connect_seconds: 6.0
    read_seconds: 30.0
    client_abort_seconds: 70.0
  hosting:
    platform: "render" # render | huggingface | railway | fly
    root_directory: "backend"
```
