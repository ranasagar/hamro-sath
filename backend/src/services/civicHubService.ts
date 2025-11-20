/**
 * Civic Hub Service
 * Business logic for ward cleanliness, community projects, and AI chatbot
 */

import { civicHubQueries } from '../database/advancedQueries';
import { CommunityProject, WardCleanlinessScore } from '../types/advancedFeatures';
import karmaService from './karmaService';

export class CivicHubService {
  /**
   * Get real-time ward cleanliness scores
   */
  async getWardScores(): Promise<WardCleanlinessScore[]> {
    const scores = await civicHubQueries.getWardScores();

    // Add rankings
    return scores.map((score, index) => ({
      ...score,
      rank: index + 1,
      trend: this.calculateTrend(score.score, score.previous_score || score.score),
    }));
  }

  /**
   * Calculate score trend
   */
  private calculateTrend(current: number, previous: number): 'improving' | 'declining' | 'stable' {
    const diff = current - previous;
    if (diff > 2) return 'improving';
    if (diff < -2) return 'declining';
    return 'stable';
  }

  /**
   * Get community projects with voting data
   */
  async getCommunityProjects(filters?: {
    status?: string;
    wardId?: number;
    category?: string;
  }): Promise<CommunityProject[]> {
    const projects = await civicHubQueries.getProjects(filters?.status, filters?.wardId);

    return projects.map((project) => ({
      ...project,
      vote_percentage: this.calculateVotePercentage(project.votes_for, project.votes_against),
      community_support: this.getCommunitySupport(project.votes_for, project.votes_against),
    }));
  }

  /**
   * Calculate vote percentage
   */
  private calculateVotePercentage(votesFor: number, votesAgainst: number): number {
    const total = votesFor + votesAgainst;
    return total > 0 ? Math.round((votesFor / total) * 100) : 0;
  }

  /**
   * Get community support level
   */
  private getCommunitySupport(
    votesFor: number,
    votesAgainst: number
  ): 'strong' | 'moderate' | 'weak' | 'none' {
    const percentage = this.calculateVotePercentage(votesFor, votesAgainst);
    if (percentage >= 75) return 'strong';
    if (percentage >= 50) return 'moderate';
    if (percentage >= 25) return 'weak';
    return 'none';
  }

  /**
   * Propose new community project
   */
  async proposeProject(data: {
    title: string;
    description: string;
    wardId: number;
    proposedBy: number;
    category: string;
    estimatedCost?: number;
  }): Promise<CommunityProject> {
    // Create project
    const project = await civicHubQueries.createProject({
      title: data.title,
      description: data.description,
      ward_id: data.wardId,
      proposed_by: data.proposedBy,
      category: data.category,
      estimated_cost: data.estimatedCost,
    });

    // Award karma for civic engagement
    await karmaService.awardKarma(
      data.proposedBy,
      'event_organized',
      50,
      `Proposed community project: ${data.title}`,
      { project_id: project.id }
    );

    return project;
  }

  /**
   * Vote on community project
   */
  async voteOnProject(
    projectId: number,
    userId: number,
    vote: 'for' | 'against',
    reason?: string
  ): Promise<void> {
    await civicHubQueries.voteOnProject(projectId, userId, vote, reason);

    // Award small karma for civic participation
    await karmaService.awardKarma(
      userId,
      'neighbor_education',
      5,
      `Voted on community project #${projectId}`,
      { project_id: projectId, vote }
    );
  }

  /**
   * Get AI chatbot response (placeholder for actual AI integration)
   */
  async getChatbotResponse(data: {
    userId: number;
    wardId: number;
    message: string;
    language: 'en' | 'ne';
  }): Promise<{ response: string; suggestions?: string[] }> {
    // Placeholder - would integrate with actual AI service
    // For now, return rule-based responses
    const message = data.message.toLowerCase();

    // Recycling queries
    if (message.includes('recycle') || message.includes('plastic')) {
      return {
        response:
          data.language === 'ne'
            ? 'तपाईंको वार्डमा प्लास्टिक पुन: प्रयोग केन्द्र हरु छन्। नजिकको केन्द्र खोज्नुहोस्।'
            : 'Your ward has plastic recycling centers. Find the nearest location on the map.',
        suggestions: ['Show recycling centers', 'Recycling guidelines', 'Earn karma by recycling'],
      };
    }

    // Cleanliness queries
    if (message.includes('clean') || message.includes('garbage')) {
      return {
        response:
          data.language === 'ne'
            ? 'तपाईंको वार्डको सफाई स्कोर हेर्नुहोस् र सुधार गर्न मद्दत गर्नुहोस्।'
            : "Check your ward's cleanliness score and help improve it.",
        suggestions: ['View ward scores', 'Report uncollected garbage', 'Join cleanup event'],
      };
    }

    // Event queries
    if (message.includes('event') || message.includes('activity')) {
      return {
        response:
          data.language === 'ne'
            ? 'आगामी सफाई कार्यक्रमहरू र सामुदायिक गतिविधिहरू हेर्नुहोस्।'
            : 'Browse upcoming cleanup events and community activities.',
        suggestions: ['Upcoming events', 'Organize event', 'Past events'],
      };
    }

    // Default response
    return {
      response:
        data.language === 'ne'
          ? 'नमस्ते! म तपाईंलाई सफाई, पुन: प्रयोग, र सामुदायिक कार्यक्रमहरूमा मद्दत गर्न सक्छु।'
          : 'Namaste! I can help you with cleanliness, recycling, and community activities.',
      suggestions: [
        'Find recycling centers',
        'View ward cleanliness',
        'Upcoming events',
        'Earn karma points',
      ],
    };
  }

  /**
   * Get ward dashboard statistics
   */
  async getWardDashboard(wardId: number) {
    const [scores, projects] = await Promise.all([
      civicHubQueries.getWardScores(),
      civicHubQueries.getProjects(undefined, wardId),
    ]);

    const wardScore = scores.find((s) => s.ward_id === wardId);

    return {
      cleanliness: {
        score: wardScore?.score || 0,
        rank: scores.findIndex((s) => s.ward_id === wardId) + 1,
        total_wards: scores.length,
        trend: wardScore
          ? this.calculateTrend(wardScore.score, wardScore.previous_score || wardScore.score)
          : 'stable',
      },
      projects: {
        total: projects.length,
        proposed: projects.filter((p) => p.status === 'proposed').length,
        in_progress: projects.filter((p) => p.status === 'in_progress').length,
        completed: projects.filter((p) => p.status === 'completed').length,
        recent: projects.slice(0, 5),
      },
      participation: {
        total_votes: projects.reduce((sum, p) => sum + p.votes_for + p.votes_against, 0),
        active_voters: 0, // Would need additional query
      },
    };
  }

  /**
   * Get terrain-specific tips based on ward characteristics
   */
  getTerrainTips(wardId: number, terrain: 'mountain' | 'hill' | 'terai'): string[] {
    const tips: Record<string, string[]> = {
      mountain: [
        'Prevent landslides by maintaining drainage during monsoon',
        'Use biodegradable waste as compost for high-altitude farming',
        'Dispose medical waste properly - limited facilities available',
        'Organize cleanup treks to protect mountain trails',
      ],
      hill: [
        'Terrace farming helps prevent soil erosion',
        'Establish community composting units on slopes',
        'Create retaining walls to manage waste runoff',
        'Plant native trees to stabilize soil',
      ],
      terai: [
        'Manage agricultural waste through biomass energy',
        'Prevent waterlogging by clearing drainage canals',
        'Use organic fertilizers to reduce chemical runoff',
        'Establish wetland protection zones',
      ],
    };

    return tips[terrain] || tips.hill;
  }

  /**
   * Update project status (admin only)
   */
  async updateProjectStatus(
    projectId: number,
    status: 'proposed' | 'in_progress' | 'completed' | 'rejected',
    officialResponse?: string
  ): Promise<CommunityProject> {
    // Implementation would update project status and notify proposer
    // Placeholder for now
    throw new Error('Not implemented - requires admin permissions');
  }
}

export default new CivicHubService();
