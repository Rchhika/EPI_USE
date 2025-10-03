# Gravatar Integration

This application integrates Gravatar (https://en.gravatar.com/) to automatically display employee profile pictures based on their email addresses.

## How it works

1. **Automatic Avatar Generation**: When an employee's email is provided, the system automatically generates a Gravatar URL using MD5 hashing
2. **Fallback to Initials**: If no Gravatar is found for the email, the system displays initials as a fallback
3. **Consistent Styling**: All avatars use consistent styling with hover effects and proper sizing

## Implementation Details

### Components Updated

- **EmployeeTable**: Shows avatars in the first column for each employee
- **OrgChart**: Displays avatars in each node alongside employee information  
- **Dashboard**: Recent Hires section includes avatars
- **EmployeeFormDialog**: Shows avatar preview while filling out the form

### Technical Implementation

- Uses `crypto-js` library for MD5 hashing of email addresses
- Gravatar URLs follow the format: `https://www.gravatar.com/avatar/{hash}?s={size}&d=identicon&r=pg`
- Fallback to initials using first letter of first name + first letter of last name
- Consistent sizing and styling across all components

### Usage

The `EmployeeAvatar` component can be used anywhere in the application:

```tsx
import { EmployeeAvatar } from '@/components/ui/avatar';

<EmployeeAvatar 
  employee={{
    name: "John",
    surname: "Doe", 
    email: "john.doe@company.com"
  }} 
  size={40}
  className="custom-styling"
/>
```

## Benefits

- **No File Uploads Required**: Employees don't need to upload profile pictures
- **Automatic Integration**: Works seamlessly with existing employee data
- **Consistent Experience**: Same avatar appears across all parts of the application
- **Professional Appearance**: Enhances the visual appeal of the employee management system
