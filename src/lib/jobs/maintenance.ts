import prisma from '../prisma';
import { logger } from '../logger';
import { updateMarketDemandStats } from './skill-gap';

export class MaintenanceService {
    /**
     * Updates the Knowledge Base: skill demand, stale jobs, and data health.
     */
    static async updateKnowledgeBase() {
        logger.info('Maintenance: Starting Knowledge Base update...');
        
        try {
            // 1. Update Market Demand Statistics (Skill Gap Analysis)
            logger.info('Maintenance: Refreshing skill demand statistics...');
            await updateMarketDemandStats();
            
            // 2. Mark stale jobs as inactive (older than 14 days)
            logger.info('Maintenance: Cleaning up stale job postings...');
            const thresholdDate = new Date();
            thresholdDate.setDate(thresholdDate.getDate() - 14);
            
            const staleResult = await (prisma as any).jobPosting.updateMany({
                where: {
                    lastSeen: { lt: thresholdDate },
                    isActive: true
                },
                data: { isActive: false }
            });
            logger.info(`Maintenance: Deactivated ${staleResult.count} stale jobs.`);

            // 3. Purge persistent "Unknown" jobs
            const unknownResult = await (prisma as any).jobPosting.updateMany({
                where: {
                    OR: [
                        { title: 'Unknown Role' },
                        { company: 'Unknown Company' }
                    ],
                    isActive: true,
                    createdAt: { lt: new Date(Date.now() - 2 * 60 * 60 * 1000) } // At least 2 hours old to allow parsing
                },
                data: { isActive: false }
            });
            logger.info(`Maintenance: Purged ${unknownResult.count} persistent bad records.`);
            
            // 3. Data Integrity: Check for missing embeddings (if applicable)
            // This is a placeholder for future vector db maintenance
            
            logger.info('Maintenance: Knowledge Base update complete.');
        } catch (err) {
            logger.error('Maintenance: Error during KB update', err);
            throw err;
        }
    }
}
