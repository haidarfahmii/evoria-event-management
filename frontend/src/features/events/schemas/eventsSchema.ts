import * as yup from 'yup';

export const eventFormValidationSchema = yup.object().shape({
    name: yup
        .string()
        .required('Event name is required')
        .min(3, 'Event name must be at least 3 characters')
        .max(100, 'Event name cannot exceed 100 characters'),

    startDate: yup
        .date()
        .required('Start date is required')
        .typeError('Start date must be a valid date'),

    endDate: yup
        .date()
        .required('End date is required')
        .typeError('End date must be a valid date')
        .min(
            yup.ref('startDate'),
            'End date must be after start date'
        ),

    city: yup
        .string()
        .required('City is required')
        .min(2, 'City must be at least 2 characters'),

    venue: yup
        .string()
        .required('Venue name is required')
        .min(3, 'Venue name must be at least 3 characters')
        .max(100, 'Venue name cannot exceed 100 characters'),

    category: yup
        .string()
        .required('Category is required'),

    description: yup
        .string()
        .required('Description is required')
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description cannot exceed 1000 characters'),

    imageUrl: yup
        .array()
        .min(1, 'Select image is required')
        .of(
            yup.mixed<File>()
                .test('fileSize', 'Maximum file size is 5mb', (file) => {
                    if (!file) return false;
                    return file?.size < 5 * 1024 * 1024;
                })
                .test('formatFile', 'Format file not acceptable', (file) => {
                    const acceptedFiles = ['webp', 'jpg', 'jpeg', 'png'];
                    if (!file) return false;

                    const fileNameLength = file?.name.split('.').length;
                    const fileExtension = file?.name.split('.')[fileNameLength - 1];

                    return acceptedFiles.includes(fileExtension)
                })
        ),

    ticketTypes: yup
        .array()
        .of(
            yup.object().shape({
                id: yup.string().required(),
                name: yup
                    .string()
                    .required('Ticket type name is required')
                    .min(2, 'Ticket type name must be at least 2 characters')
                    .max(50, 'Ticket type name cannot exceed 50 characters'),
                price: yup
                    .number()
                    .required('Price is required')
                    .typeError('Price must be a number')
                    .positive('Price must be greater than 0'),
                seats: yup
                    .number()
                    .required('Number of seats is required')
                    .typeError('Seats must be a number')
                    .positive('Seats must be greater than 0')
                    .integer('Seats must be a whole number'),
            })
        )
        .min(1, 'At least one ticket type is required')
        .required('Ticket types are required'),
});