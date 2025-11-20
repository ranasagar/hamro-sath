/**
 * Social Accountability Service
 * Business logic for civic nudges, school quests, and disaster coordination
 */

import { socialQueries } from '../database/advancedQueries';
import {
  CivicNudge,
  DisasterEvent,
  QuestCompletion,
  StudentQuest,
} from '../types/advancedFeatures';
import karmaService from './karmaService';

export class SocialAccountabilityService {
  /**
   * Send polite civic nudge to neighbor
   */
  async sendCivicNudge(data: {
    senderId: number;
    recipientId: number;
    nudgeType: CivicNudge['nudge_type'];
    message: string;
    memeUrl?: string;
    isAnonymous?: boolean;
  }): Promise<CivicNudge> {
    // Validate nudge is polite (basic check)
    if (this.containsOffensiveContent(data.message)) {
      throw new Error('Message contains inappropriate content. Please keep it polite.');
    }

    // Create nudge
    const nudge = await socialQueries.sendNudge({
      sender_id: data.senderId,
      recipient_id: data.recipientId,
      nudge_type: data.nudgeType,
      message: data.message,
      meme_url: data.memeUrl,
      is_anonymous: data.isAnonymous || false,
    });

    // Award small karma for community engagement
    await karmaService.awardKarma(
      data.senderId,
      'neighbor_education',
      5,
      'Sent civic nudge to neighbor',
      { nudge_id: nudge.id }
    );

    return nudge;
  }

  /**
   * Basic offensive content filter
   */
  private containsOffensiveContent(text: string): boolean {
    const offensiveWords = ['hate', 'stupid', 'idiot']; // Expand as needed
    const lowerText = text.toLowerCase();
    return offensiveWords.some((word) => lowerText.includes(word));
  }

  /**
   * Get user's received nudges
   */
  async getUserNudges(userId: number): Promise<CivicNudge[]> {
    const nudges = await socialQueries.getUserNudges(userId);

    // Mark as delivered
    // TODO: Update delivery status in database

    return nudges;
  }

  /**
   * Get active student quests for school
   */
  async getStudentQuests(schoolId?: number): Promise<StudentQuest[]> {
    return socialQueries.getQuests(schoolId);
  }

  /**
   * Create new student quest (teacher only)
   */
  async createStudentQuest(data: {
    schoolId: number;
    teacherId: number;
    title: string;
    description: string;
    category: StudentQuest['category'];
    karmaReward: number;
    deadline?: Date;
  }): Promise<StudentQuest> {
    // TODO: Verify teacherId belongs to schoolId
    // Implementation would require teachers table or role verification

    throw new Error('Not implemented - requires teacher verification');
  }

  /**
   * Submit quest completion (student)
   */
  async submitQuestCompletion(data: {
    questId: number;
    studentId: number;
    proofImageUrl: string;
    description: string;
  }): Promise<QuestCompletion> {
    const completion = await socialQueries.submitQuestCompletion({
      quest_id: data.questId,
      student_id: data.studentId,
      proof_image_url: data.proofImageUrl,
      description: data.description,
    });

    return completion;
  }

  /**
   * Verify and approve quest completion (teacher only)
   */
  async approveQuestCompletion(
    completionId: number,
    teacherId: number,
    approved: boolean,
    feedback?: string
  ): Promise<void> {
    // TODO: Implement verification and karma award logic
    // Would need to:
    // 1. Verify teacherId has permission
    // 2. Update completion status
    // 3. Award karma if approved

    throw new Error('Not implemented - requires teacher verification');
  }

  /**
   * Get class leaderboard
   */
  async getClassLeaderboard(schoolId: number, grade: number, section: string) {
    // TODO: Implement class leaderboard logic
    // Would aggregate karma earned by students in specific class

    throw new Error('Not implemented - requires student-class mapping');
  }

  /**
   * Get active disaster events
   */
  async getActiveDisasters(): Promise<DisasterEvent[]> {
    return socialQueries.getDisasterEvents(true);
  }

  /**
   * Create disaster event (admin only)
   */
  async createDisasterEvent(data: {
    disasterType: DisasterEvent['disaster_type'];
    title: string;
    description: string;
    affectedWards: number[];
    severity: DisasterEvent['severity'];
  }): Promise<DisasterEvent> {
    // TODO: Implement disaster event creation
    // Would require admin permission check

    throw new Error('Not implemented - requires admin verification');
  }

  /**
   * Register as disaster volunteer
   */
  async registerVolunteer(data: {
    userId: number;
    disasterId: number;
    skills: string[];
    availability: string;
  }): Promise<void> {
    // TODO: Implement volunteer registration
    // Would create entry in disaster_volunteers table

    throw new Error('Not implemented - requires disaster_volunteers table queries');
  }

  /**
   * Get disaster coordination dashboard
   */
  async getDisasterDashboard(disasterId: number) {
    // TODO: Implement disaster coordination dashboard
    // Would show:
    // - Affected areas map
    // - Volunteer count by skill
    // - Supply needs
    // - Coordination messages

    throw new Error('Not implemented - requires comprehensive disaster queries');
  }

  /**
   * Send mass notification for disaster (admin only)
   */
  async sendDisasterAlert(data: {
    disasterId: number;
    wardIds: number[];
    message: string;
    priority: 'critical' | 'high' | 'medium';
  }): Promise<void> {
    // TODO: Implement mass notification system
    // Would integrate with push notification service

    throw new Error('Not implemented - requires notification service integration');
  }

  /**
   * Get nudge statistics for ward
   */
  async getWardNudgeStats(wardId: number) {
    // TODO: Implement ward nudge statistics
    // Would show:
    // - Most common nudge types
    // - Nudge effectiveness (response rate)
    // - Top nudge senders/recipients

    return {
      total_nudges: 0,
      by_type: {},
      trending_issues: [],
    };
  }

  /**
   * Get recommended memes for nudge type
   */
  getRecommendedMemes(nudgeType: CivicNudge['nudge_type']): string[] {
    const memeLibrary: Record<string, string[]> = {
      waste_segregation: [
        '/memes/waste-sorting.jpg',
        '/memes/recycle-hero.jpg',
        '/memes/plastic-villain.jpg',
      ],
      noise_pollution: ['/memes/quiet-please.jpg', '/memes/peace-keeper.jpg'],
      littering: [
        '/memes/trash-hero.jpg',
        '/memes/clean-streets.jpg',
        '/memes/dustbin-this-way.jpg',
      ],
      water_waste: ['/memes/save-water.jpg', '/memes/tap-off.jpg'],
      public_urination: ['/memes/use-toilet.jpg', '/memes/public-restroom.jpg'],
      spitting: ['/memes/no-spitting.jpg', '/memes/hygiene-hero.jpg'],
    };

    return memeLibrary[nudgeType] || ['/memes/be-civic.jpg'];
  }

  /**
   * Get nudge templates for type
   */
  getNudgeTemplates(nudgeType: CivicNudge['nudge_type'], language: 'en' | 'ne'): string[] {
    const templates: Record<string, Record<string, string[]>> = {
      waste_segregation: {
        en: [
          "Hey neighbor! 👋 Let's sort our waste together for a cleaner ward!",
          'Small action, big impact! Could you separate your waste? 🌱',
          'Join the green team! Waste segregation helps our community. ♻️',
        ],
        ne: [
          'नमस्ते छिमेकी! फोहोर छुट्याउनुस्, सफा वार्ड बनाउनुस्! 🌱',
          'सानो प्रयास, ठूलो परिवर्तन! फोहोर छुट्याउनुहोस्! ♻️',
        ],
      },
      littering: {
        en: [
          "Dustbin is just a few steps away! Let's keep our streets clean. 🗑️",
          'Be a hero, use the trash can! Our ward thanks you. 🦸',
          'Clean streets = Happy community! Please use dustbins. 😊',
        ],
        ne: ['डस्टबिन नजिकै छ! सडक सफा राखौं! 🗑️', 'नायक बनौं, डस्टबिन प्रयोग गरौं! 🦸'],
      },
    };

    const typeTemplates = templates[nudgeType];
    return typeTemplates ? typeTemplates[language] : ["Let's keep our community clean!"];
  }
}

export default new SocialAccountabilityService();
