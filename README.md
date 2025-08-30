# College Appointment System

A comprehensive backend API system for managing college appointments between students and professors. The system allows professors to specify their availability, students to book appointments, and provides robust authentication and authorization.

## Features

- **User Authentication**: Secure JWT-based authentication for students and professors
- **Role-based Access Control**: Different permissions for students and professors
- **Availability Management**: Professors can specify and manage their available time slots
- **Appointment Booking**: Students can view available slots and book appointments
- **Appointment Management**: Cancel, complete, and track appointment status
- **Data Integrity**: Prevents double-booking and maintains data consistency
- **Comprehensive Testing**: End-to-end test coverage for all user flows

## User Flow

The system supports the following complete user flow:

1. **Student A1** authenticates to access the system
2. **Professor P1** authenticates to access the system
3. **Professor P1** specifies which time slots they are free for appointments
4. **Student A1** views available time slots for Professor P1
5. **Student A1** books an appointment with Professor P1 for time T1
6. **Student A2** authenticates to access the system
7. **Student A2** books an appointment with Professor P1 for time T2
8. **Professor P1** cancels the appointment with Student A1
9. **Student A1** checks their appointments and realizes they have no pending appointments

## Database Schema

### Users
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password using bcrypt
- `role`: Either "student" or "professor"
- `timestamps`: Created and updated timestamps

### Availability
- `professorId`: Reference to professor user
- `date`: Date of availability
- `startTime`: Start time in HH:MM format
- `endTime`: End time in HH:MM format
- `isAvailable`: Boolean flag for availability status
- `timestamps`: Created and updated timestamps

### Appointments
- `studentId`: Reference to student user
- `professorId`: Reference to professor user
- `date`: Appointment date
- `startTime`: Start time in HH:MM format
- `endTime`: End time in HH:MM format
- `status`: Appointment status (scheduled, completed, cancelled)
- `notes`: Optional notes for the appointment
- `timestamps`: Created and updated timestamps

## API Endpoints

### Authentication (`/api/auth`)

#### POST `/api/auth/register`
Register a new user (student or professor)
```json
{
  "name": "John Doe",
  "email": "john@college.edu",
  "password": "password123",
  "role": "student"
}
```

#### POST `/api/auth/login`
Authenticate user and receive JWT token
```json
{
  "email": "john@college.edu",
  "password": "password123"
}
```

### Availability (`/api/availability`)

#### POST `/api/availability` (Professor only)
Add a new availability slot
```json
{
  "date": "2024-01-15T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "10:00"
}
```

#### GET `/api/availability/professor/:professorId`
Get professor's availability slots (with optional date filter)

#### GET `/api/availability/available/:professorId` (Student only)
Get available slots for a professor (excluding booked appointments)

#### DELETE `/api/availability/:id` (Professor only)
Remove an availability slot

### Appointments (`/api/appointments`)

#### POST `/api/appointments` (Student only)
Book a new appointment
```json
{
  "professorId": "professor_id_here",
  "date": "2024-01-15T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "10:00",
  "notes": "Need help with calculus homework"
}
```

#### GET `/api/appointments/student`
Get current user's appointments (students only)

#### GET `/api/appointments/professor`
Get current user's appointments (professors only)

#### PATCH `/api/appointments/:id/cancel`
Cancel an appointment

#### PATCH `/api/appointments/:id/complete` (Professor only)
Mark appointment as completed

#### GET `/api/appointments/:id`
Get appointment details by ID

## Installation and Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start MongoDB service
4. Start the server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development, production, test)

## Testing

Run the comprehensive test suite:
```bash
npm test
```

The test suite includes:
- **Authentication Tests**: User registration and login
- **End-to-End Flow Tests**: Complete appointment booking workflow
- **Data Integrity Tests**: Validation and business rule enforcement
- **Authorization Tests**: Role-based access control

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Different permissions for students and professors
- **Input Validation**: Comprehensive validation for all inputs
- **SQL Injection Protection**: Mongoose ODM prevents injection attacks

## Business Rules

1. **No Double Booking**: Students cannot book overlapping time slots
2. **Role Restrictions**: Only professors can manage availability, only students can book appointments
3. **Time Validation**: End time must be after start time
4. **Future Dates Only**: Cannot book appointments in the past
5. **Cancellation Handling**: Cancelled appointments are excluded from active lists

## Error Handling

The API provides comprehensive error handling:
- **400 Bad Request**: Invalid input data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **409 Conflict**: Business rule violations (e.g., double booking)
- **500 Internal Server Error**: Server-side errors

## Performance Considerations

- **Database Indexing**: Compound indexes on frequently queried fields
- **Efficient Queries**: Optimized MongoDB queries with proper projections
- **Connection Pooling**: Mongoose connection management
- **Async/Await**: Non-blocking I/O operations

## Future Enhancements

- **Email Notifications**: Automated reminders and confirmations
- **Calendar Integration**: Sync with external calendar systems
- **Recurring Appointments**: Support for regular meeting schedules
- **Video Conferencing**: Integration with video call platforms
- **Mobile App**: React Native or Flutter mobile application
- **Admin Dashboard**: Administrative interface for system management

## License

ISC License
