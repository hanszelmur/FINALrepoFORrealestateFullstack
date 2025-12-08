import cron from 'node-cron';
import { expireReservations } from '../services/inquiryService';

export const startReservationExpiryJob = (): void => {
    // Run daily at midnight
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('Running reservation expiry job...');
            const expiredCount = await expireReservations();
            console.log(`✓ Expired ${expiredCount} reservations`);
        } catch (error) {
            console.error('✗ Error running reservation expiry job:', error);
        }
    });

    console.log('✓ Reservation expiry cron job scheduled (daily at midnight)');
};
