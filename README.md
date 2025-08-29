# College Appointment System

A backend API system that allows students to book appointments with professors. The system enables professors to specify their availability, manage bookings, and allows students to authenticate, view available slots, and book appointments.

## Features

- **User Authentication**: Role-based authentication for students and professors
- **Availability Management**: Professors can specify and manage their available time slots
- **Appointment Booking**: Students can view available slots and book appointments
- **Appointment Management**: Professors can cancel appointments, students can view their bookings
- **Data Validation**: Comprehensive validation for time slots, appointments, and user permissions
- **Automated Testing**: Complete E2E test coverage for all user flows

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration (student/professor)
- `POST /api/auth/login` - User authentication

### Availability Management
- `POST /api/availability` - Add availability slot (professor only)
- `GET /api/availability/professor/:professorId` - Get professor's availability
- `GET /api/availability/available/:professorId` - Get available slots for students
- `DELETE /api/availability/:id` - Remove availability slot (professor only)

### Appointment Management
- `POST /api/appointments` - Book appointment (student only)
- `GET /api/appointments/student` - Get student's appointments
- `GET /api/appointments/professor` - Get professor's appointments
- `PATCH /api/appointments/:id/cancel` - Cancel appointment
- `PATCH /api/appointments/:id/complete` - Mark appointment as completed (professor only)
- `GET /api/appointments/:id` - Get appointment details

## Database Schema

### User Model
- `name`: String (required)
- `email`: String (required, unique)
- `password`: String (required, hashed)
- `role`: String (required, enum: "student" | "professor")
- `timestamps`: Created/updated timestamps

### Availability Model
- `professorId`: ObjectId (reference to User)
- `date`: Date (required)
- `startTime`: String (required, HH:MM format)
- `endTime`: String (required, HH:MM format)
- `isAvailable`: Boolean (default: true)
- `timestamps`: Created/updated timestamps

### Appointment Model
- `studentId`: ObjectId (reference to User)
- `professorId`: ObjectId (reference to User)
- `date`: Date (required)
- `startTime`: String (required)
- `endTime`: String (required)
- `status`: String (enum: "scheduled" | "completed" | "cancelled")
- `notes`: String (optional)
- `timestamps`: Created/updated timestamps

## User Flow

1. **Student A1** authenticates to access the system
2. **Professor P1** authenticates to access the system
3. **Professor P1** specifies which time slots he is free for appointments
4. **Student A1** views available time slots for Professor P1
5. **Student A1** books an appointment with Professor P1 for time T1
6. **Student A2** authenticates to access the system
7. **Student A2** books an appointment with Professor P1 for time T2
8. **Professor P1** cancels the appointment with Student A1
9. **Student A1** checks their appointments and realizes they do not have any pending appointments

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make sure MongoDB is running on `mongodb://127.0.0.1:27017`
4. Start the server:
   ```bash
   npm start
   ```

## Development

- Start development server with auto-reload:
  ```bash
  npm run dev
  ```

## Testing

Run the complete test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

The test suite includes 19 comprehensive test cases covering:
- User registration and authentication
- Professor availability management
- Student appointment viewing
- Appointment booking and management
- Appointment cancellation
- Data integrity and validation
- Role-based access control

## Security Features

- Password hashing using bcryptjs
- JWT-based authentication
- Role-based access control
- Input validation and sanitization
- Database constraints and unique indexes

## Error Handling

- Comprehensive error messages
- Proper HTTP status codes
- Input validation errors
- Authentication and authorization errors
- Database constraint violations

## Dependencies

- **Express.js**: Web framework
- **MongoDB/Mongoose**: Database and ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **Jest**: Testing framework
- **Supertest**: HTTP testing
- **Nodemon**: Development server (dev dependency)

## License

ISC
