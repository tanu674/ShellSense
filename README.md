# 🐚 ShellSense

### AI-Powered Natural Language Shell Assistant for Linux

> **Speak Linux. Safely.**

ShellSense is an AI-powered natural language shell assistant that allows users to interact with Linux using plain English instead of memorizing complex terminal commands.

It converts natural-language requests into shell commands, explains what each command does, analyzes its risk level, and requires appropriate confirmation before execution.

ShellSense is designed to make the Linux command line **accessible, explainable, and safer** for beginners while improving productivity for experienced users.

---

## 🚀 Why ShellSense?

Linux provides powerful command-line tools, but the terminal has a steep learning curve.

Users need to remember hundreds of commands, flags, and syntax rules. A small mistake can also lead to serious consequences, especially when using destructive commands such as `rm -rf`.

ShellSense creates a safe bridge between **plain English and shell commands**.

Instead of asking:

```bash
find . -type f -name "*.py" -size +10M
```

users can simply ask:

> "Find Python files larger than 10MB."

ShellSense generates the command, explains it, evaluates its risk, and allows the user to review it before execution.

---

## ✨ Key Features

### 🗣️ Natural Language → Shell

Describe what you want to do in plain English and ShellSense generates the appropriate Linux command.

### 🔍 Command Explanation

Every generated command is accompanied by a simple explanation of what it does and what important flags mean.

### 🛡️ Risk-Aware Safety Engine

Commands are classified based on their potential impact:

* 🟢 **LOW** — Read-only or generally safe commands
* 🟡 **MEDIUM** — Commands that modify system state
* 🟠 **HIGH** — Commands that may modify or delete data
* 🔴 **CRITICAL** — Potentially destructive commands

### ⚠️ Risk-Tiered Confirmation

ShellSense does not blindly execute AI-generated commands.

The level of confirmation depends on the risk associated with the command.

### 🚫 Destructive Command Protection

Potentially dangerous commands are detected and can be blocked before execution.

### 🧠 Explainable AI

ShellSense does more than generate commands.

It helps users understand:

* What the command does
* Why the command was generated
* What each important flag means
* What risks are associated with it

### 🔒 Privacy-First Architecture

ShellSense is designed to support local AI through technologies such as Ollama, allowing future deployments where system information can remain on the user's machine.

### 📚 Learning Mode

Users can learn Linux commands while using the assistant instead of simply copying commands without understanding them.

### 📜 Command History

Previously generated commands and their execution status can be reviewed for transparency and auditing.

---

## 🔄 How It Works

```text
User Intent
     ↓
Natural Language Request
     ↓
AI Command Generation
     ↓
Command Preview
     ↓
Plain-English Explanation
     ↓
Risk Analysis
     ↓
User Confirmation
     ↓
Safe / Sandboxed Execution
     ↓
Terminal Output
```

---

## 🧪 Example

### User Request

> Find all Python files in the current directory.

### ShellSense Generates

```bash
find . -type f -name "*.py"
```

### Explanation

* `find` → searches files and directories
* `.` → starts searching from the current directory
* `-type f` → searches for files
* `-name "*.py"` → finds Python files

### Risk

```text
LOW RISK
Read-only command
```

The user can review the command before execution.

---

## 🛡️ Safety Model

ShellSense follows a **review-before-execution** approach.

AI-generated commands are never trusted automatically.

The system performs safety analysis before execution.

### Safety Pipeline

```text
AI Generated Command
        ↓
Safety Engine
        ↓
Risk Classification
        ↓
Explanation
        ↓
Confirmation
        ↓
Execution / Block
```

For critical commands, execution can be blocked completely.

---

## 🏗️ Architecture

```text
                 ┌──────────────────┐
                 │      User        │
                 │  Plain English   │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │   AI / LLM       │
                 │ Command Generator│
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │ Command Preview  │
                 │ + Explanation    │
                 └────────┬─────────┘
                          ↓
                 ┌──────────────────┐
                 │  Safety Engine   │
                 │ Risk Classifier  │
                 └────────┬─────────┘
                          ↓
                ┌─────────┴─────────┐
                ↓                   ↓
          Safe / Confirm       Critical
                ↓                   ↓
          Sandbox Execute        Block
                ↓
          Terminal Output
```

---

## 🧰 Technology Stack

### Frontend

* React
* TypeScript
* Tailwind CSS

### AI

* Google Gemini API
* Future support for local LLMs through Ollama

### Backend

* API-based architecture
* Safety analysis layer
* Command execution layer
* Command history

### Execution

* Linux / Bash
* Sandboxed or simulated execution for the prototype

---

## 📁 Project Structure

```text
ShellSense/
│
├── frontend/
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── types/
│
├── backend/
│   ├── ai/
│   ├── safety/
│   ├── execution/
│   ├── api/
│   └── history/
│
├── README.md
├── .gitignore
└── package.json
```

> The exact folder structure may vary depending on the implementation.

---

## 🎯 Use Cases

### 👨‍🎓 Students

Learn Linux commands without being intimidated by the terminal.

### 👨‍💻 Developers

Quickly generate commands without searching documentation for unfamiliar syntax.

### ⚙️ DevOps Engineers

Speed up command-line workflows while maintaining safety checks.

### 🏢 Enterprises

Provide a foundation for safer and auditable command execution across teams.

### 👩‍🏫 Educators

Use command explanations as a learning tool for teaching Linux fundamentals.

---

## 🌱 Future Scope

ShellSense can be extended with:

* ↩️ Undo and rollback
* 🔗 Multi-step command automation
* 🎙️ Voice-based commands
* 🐧 Native Bash/Zsh integration
* 🦙 Ollama/local LLM integration
* 📊 Enterprise audit logging
* 💾 Snapshot-based rollback
* 🔐 Advanced permission-aware execution

---

## 🔐 Security Principles

ShellSense follows these principles:

1. Never automatically trust AI-generated commands.
2. Always show the command before execution.
3. Explain the command to the user.
4. Analyze command risk before execution.
5. Require confirmation for risky operations.
6. Block clearly destructive operations.
7. Re-check safety before execution.
8. Keep API keys out of frontend source code.
9. Prefer sandboxed execution.
10. Maintain command history for transparency.

---

## 🧑‍💻 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR-USERNAME/ShellSense.git
cd ShellSense
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env` file:

```env
GEMINI_API_KEY=your_api_key_here
```

**Never commit your `.env` file to GitHub.**

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in your terminal.

---

## ⚠️ Prototype Safety Notice

ShellSense is a hackathon/research prototype.

Command execution should use a sandboxed environment rather than the user's real operating system.

Do not use the prototype to execute unknown or destructive commands on production systems.

---

## 🏆 Hackathon

Built for the **National Level SSM Hackathon**.

### Team

* Tanishka V
* Sanjana A
* Riya Sterlina S
* Shameera Fathima S

---

## 💡 Vision

> **ShellSense doesn't just write commands.
> It helps users understand, review, and safely execute them.**

---

## ⭐ Support

If you find ShellSense interesting, consider giving the repository a ⭐.

Built with curiosity, Linux, AI, and a focus on safe developer tooling.


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
