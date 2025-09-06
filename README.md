# SpeakTaskr

**Your Voice, Your Tasks, Seamlessly Organized.**

A voice-activated AI agent that captures spoken thoughts, turns them into actionable tasks and calendar events, and sets intelligent reminders for users within the Base ecosystem.

![SpeakTaskr Preview](https://via.placeholder.com/800x400/6366f1/ffffff?text=SpeakTaskr+Preview)

## Features

### Core Features
- 🎤 **Voice-to-Task Creation**: Speak your tasks and let AI convert them to actionable items
- 📅 **Smart Calendar Integration**: Schedule events using natural voice commands
- 🔔 **Intelligent Reminders**: AI-powered reminder suggestions based on context
- 🎨 **Beautiful UI**: Glass morphism design with smooth animations

### Premium Features
- 🧠 **AI Task Prioritization**: Intelligent task prioritization with insights ($0.75 for 10 credits)
- 🔔 **Proactive Reminders**: Smart, context-aware reminder suggestions ($0.25 for 5 credits)
- ⭐ **Advanced Task Sequencing**: AI-powered task sequencing and optimization ($0.50 for 5 credits)
- 💎 **Premium Subscription**: Unlimited access to all features ($9.99/month)

### Technical Features
- 🗄️ **Supabase Integration**: Real-time database synchronization
- 💳 **Turnkey Payments**: Secure micro-transactions on Base blockchain
- 🔄 **Data Migration**: Seamless migration from local storage to cloud
- 🎯 **Real-time Updates**: Live synchronization across devices

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **AI/ML**: OpenAI API (GPT-4, Whisper)
- **Database**: Supabase (PostgreSQL)
- **Payments**: Turnkey API (Base blockchain)
- **Styling**: Glass morphism design system
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- OpenAI API key
- Supabase project (optional, for cloud sync)
- Turnkey API key (optional, for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/vistara-apps/this-is-a-0573.git
   cd this-is-a-0573
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your API keys:
   ```env
   # Required for AI features
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   
   # Optional: For cloud sync
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Optional: For payments
   VITE_TURNKEY_API_KEY=your_turnkey_api_key
   VITE_TURNKEY_BASE_URL=https://api.turnkey.tech
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## Usage

### Basic Usage

1. **Create Tasks**: Click the microphone button and speak your task
   - "Remind me to call mom at 5 PM"
   - "Buy groceries tomorrow"
   - "Finish the project presentation by Friday"

2. **Schedule Events**: Use natural language for calendar events
   - "Schedule a meeting with John tomorrow at 3 PM"
   - "Doctor appointment next Tuesday at 10 AM"

3. **Manage Tasks**: 
   - Check off completed tasks
   - Configure reminders for each task
   - Delete tasks you no longer need

### Premium Features

1. **AI Prioritization**: 
   - Click "Optimize Tasks" to use AI prioritization
   - Get insights on task importance and urgency
   - Automatic reordering based on AI analysis

2. **Smart Reminders**:
   - Click the settings icon on any task
   - Get AI-suggested reminder times
   - Context-aware notification scheduling

3. **Purchase Credits**:
   - Go to the Premium tab
   - Choose individual features or monthly subscription
   - Pay securely with Base wallet integration

## API Integration

### OpenAI Integration

The app uses OpenAI's APIs for:
- **Whisper**: Speech-to-text transcription
- **GPT-4**: Natural language understanding and task parsing
- **AI Analysis**: Task prioritization and reminder suggestions

### Supabase Integration

Real-time database features:
- User profile management
- Task and event synchronization
- Real-time updates across devices
- Data migration from local storage

### Turnkey Payments

Secure blockchain payments:
- Micro-transactions for individual features
- Monthly subscription management
- Credit tracking and usage
- Base blockchain integration

## Development

### Project Structure

```
src/
├── components/          # React components
│   ├── Header.jsx      # App header with navigation
│   ├── VoiceInput.jsx  # Voice recording interface
│   ├── TaskList.jsx    # Task management with AI features
│   ├── CalendarView.jsx # Calendar event display
│   ├── PremiumFeatures.jsx # Premium feature management
│   └── ReminderConfigurator.jsx # Reminder setup
├── services/           # API integrations
│   ├── api.js         # OpenAI service layer
│   ├── supabase.js    # Database operations
│   └── payment.js     # Payment processing
├── hooks/             # Custom React hooks
│   ├── useOpenAI.js   # OpenAI integration hook
│   └── useLocalStorage.js # Local storage management
└── styles/            # CSS and styling
```

### Key Components

- **VoiceInput**: Handles audio recording and transcription
- **TaskList**: Displays tasks with AI prioritization and reminders
- **ReminderConfigurator**: Advanced reminder setup with AI suggestions
- **PremiumFeatures**: Payment integration and feature management

### Services

- **apiService**: Centralized OpenAI API integration
- **databaseService**: Supabase operations with fallbacks
- **paymentService**: Turnkey integration with mock support

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENAI_API_KEY` | Yes | OpenAI API key for AI features |
| `VITE_SUPABASE_URL` | No | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | No | Supabase anonymous key |
| `VITE_TURNKEY_API_KEY` | No | Turnkey API key for payments |
| `VITE_TURNKEY_BASE_URL` | No | Turnkey API base URL |
| `VITE_DEV_MODE` | No | Enable mock services for development |

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farcaster_id TEXT UNIQUE,
  wallet_address TEXT,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  task_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  due_date TIMESTAMP WITH TIME ZONE,
  priority TEXT DEFAULT 'medium',
  reminder_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Calendar Events Table
```sql
CREATE TABLE calendar_events (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(user_id),
  title TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  attendees TEXT[],
  reminder_settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@speaktaskr.com or join our Discord community.

## Roadmap

- [ ] Mobile app (React Native)
- [ ] Farcaster Frame integration
- [ ] Team collaboration features
- [ ] Advanced analytics dashboard
- [ ] Integration with popular calendar apps
- [ ] Voice commands for task management
- [ ] Multi-language support

---

Built with ❤️ for the Base ecosystem
