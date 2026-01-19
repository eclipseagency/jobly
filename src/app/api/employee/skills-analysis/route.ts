import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface SkillAnalysis {
  skill: string;
  userLevel: number;
  marketDemand: 'low' | 'medium' | 'high' | 'critical';
  averageRequired: number;
  gap: number;
  recommendations: string[];
  relatedJobs: number;
  salaryImpact: number;
}

// Skill demand data (in production, this would come from job market analysis)
const SKILL_MARKET_DATA: Record<string, { demand: 'low' | 'medium' | 'high' | 'critical'; avgRequired: number; salaryBoost: number }> = {
  // Programming Languages
  'javascript': { demand: 'critical', avgRequired: 75, salaryBoost: 15 },
  'typescript': { demand: 'critical', avgRequired: 70, salaryBoost: 20 },
  'python': { demand: 'critical', avgRequired: 70, salaryBoost: 18 },
  'java': { demand: 'high', avgRequired: 75, salaryBoost: 15 },
  'c#': { demand: 'high', avgRequired: 70, salaryBoost: 12 },
  'go': { demand: 'high', avgRequired: 65, salaryBoost: 22 },
  'rust': { demand: 'medium', avgRequired: 60, salaryBoost: 25 },
  'php': { demand: 'medium', avgRequired: 65, salaryBoost: 8 },
  'ruby': { demand: 'medium', avgRequired: 65, salaryBoost: 10 },
  'swift': { demand: 'high', avgRequired: 70, salaryBoost: 18 },
  'kotlin': { demand: 'high', avgRequired: 65, salaryBoost: 16 },

  // Frontend
  'react': { demand: 'critical', avgRequired: 75, salaryBoost: 18 },
  'vue': { demand: 'high', avgRequired: 70, salaryBoost: 15 },
  'angular': { demand: 'high', avgRequired: 70, salaryBoost: 14 },
  'next.js': { demand: 'high', avgRequired: 65, salaryBoost: 20 },
  'html': { demand: 'high', avgRequired: 80, salaryBoost: 5 },
  'css': { demand: 'high', avgRequired: 75, salaryBoost: 5 },
  'tailwind': { demand: 'high', avgRequired: 65, salaryBoost: 10 },

  // Backend
  'node.js': { demand: 'critical', avgRequired: 70, salaryBoost: 15 },
  'express': { demand: 'high', avgRequired: 65, salaryBoost: 8 },
  'django': { demand: 'high', avgRequired: 65, salaryBoost: 12 },
  'spring': { demand: 'high', avgRequired: 70, salaryBoost: 14 },
  'graphql': { demand: 'high', avgRequired: 60, salaryBoost: 15 },
  'rest api': { demand: 'critical', avgRequired: 75, salaryBoost: 10 },

  // Databases
  'sql': { demand: 'critical', avgRequired: 70, salaryBoost: 10 },
  'postgresql': { demand: 'high', avgRequired: 65, salaryBoost: 12 },
  'mongodb': { demand: 'high', avgRequired: 60, salaryBoost: 10 },
  'redis': { demand: 'high', avgRequired: 55, salaryBoost: 12 },
  'mysql': { demand: 'high', avgRequired: 65, salaryBoost: 8 },

  // Cloud & DevOps
  'aws': { demand: 'critical', avgRequired: 65, salaryBoost: 22 },
  'azure': { demand: 'high', avgRequired: 60, salaryBoost: 18 },
  'gcp': { demand: 'high', avgRequired: 55, salaryBoost: 18 },
  'docker': { demand: 'critical', avgRequired: 65, salaryBoost: 15 },
  'kubernetes': { demand: 'high', avgRequired: 60, salaryBoost: 22 },
  'terraform': { demand: 'high', avgRequired: 55, salaryBoost: 18 },
  'ci/cd': { demand: 'high', avgRequired: 60, salaryBoost: 12 },
  'git': { demand: 'critical', avgRequired: 80, salaryBoost: 5 },

  // AI/ML
  'machine learning': { demand: 'high', avgRequired: 65, salaryBoost: 30 },
  'deep learning': { demand: 'high', avgRequired: 60, salaryBoost: 35 },
  'tensorflow': { demand: 'high', avgRequired: 55, salaryBoost: 25 },
  'pytorch': { demand: 'high', avgRequired: 55, salaryBoost: 28 },
  'nlp': { demand: 'high', avgRequired: 55, salaryBoost: 30 },
  'llm': { demand: 'critical', avgRequired: 50, salaryBoost: 40 },

  // Soft Skills
  'communication': { demand: 'critical', avgRequired: 75, salaryBoost: 10 },
  'leadership': { demand: 'high', avgRequired: 70, salaryBoost: 20 },
  'teamwork': { demand: 'critical', avgRequired: 75, salaryBoost: 8 },
  'problem solving': { demand: 'critical', avgRequired: 80, salaryBoost: 12 },
  'project management': { demand: 'high', avgRequired: 65, salaryBoost: 18 },
  'agile': { demand: 'high', avgRequired: 65, salaryBoost: 10 },
  'scrum': { demand: 'high', avgRequired: 60, salaryBoost: 8 },
};

function getRecommendations(skill: string, userLevel: number, gap: number): string[] {
  const recommendations: string[] = [];
  const normalizedSkill = skill.toLowerCase();

  if (gap > 30) {
    recommendations.push(`Consider taking an intensive course on ${skill}`);
    recommendations.push(`Look for entry-level projects to build ${skill} experience`);
  } else if (gap > 15) {
    recommendations.push(`Practice ${skill} through side projects or open source`);
    recommendations.push(`Join online communities focused on ${skill}`);
  } else if (gap > 0) {
    recommendations.push(`Refine your ${skill} expertise with advanced tutorials`);
    recommendations.push(`Mentor others in ${skill} to solidify your knowledge`);
  }

  // Skill-specific recommendations
  if (['javascript', 'typescript', 'python'].includes(normalizedSkill)) {
    recommendations.push(`Build a portfolio project showcasing your ${skill} skills`);
  }
  if (['aws', 'azure', 'gcp'].includes(normalizedSkill)) {
    recommendations.push(`Get certified in ${skill.toUpperCase()} to validate your skills`);
  }
  if (['machine learning', 'deep learning'].includes(normalizedSkill)) {
    recommendations.push(`Participate in Kaggle competitions to improve`);
  }

  return recommendations.slice(0, 3);
}

// GET /api/employee/skills-analysis - Get skills gap analysis
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile with skills
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        skills: true,
        headline: true,
        applications: {
          select: {
            job: {
              select: {
                requirements: true,
                title: true,
                salaryMin: true,
                salaryMax: true,
              },
            },
          },
          take: 20,
          orderBy: { appliedAt: 'desc' },
        },
        careerGoals: {
          where: { status: 'active' },
          select: {
            targetRole: true,
            skillTargets: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const userSkills = user.skills || [];

    // Parse skills - assume format "Skill:Level" or just "Skill"
    const parsedUserSkills: Record<string, number> = {};
    userSkills.forEach((skill) => {
      const parts = skill.split(':');
      const skillName = parts[0].trim().toLowerCase();
      const level = parts[1] ? parseInt(parts[1]) : 50; // Default to 50% if no level
      parsedUserSkills[skillName] = level;
    });

    // Collect skills from applied jobs for analysis
    const jobSkillsRequired: string[] = [];
    user.applications.forEach((app) => {
      if (app.job.requirements) {
        // Extract skill keywords from requirements
        const reqLower = app.job.requirements.toLowerCase();
        Object.keys(SKILL_MARKET_DATA).forEach((skill) => {
          if (reqLower.includes(skill)) {
            jobSkillsRequired.push(skill);
          }
        });
      }
    });

    // Collect skills from career goals
    const careerGoalSkills: string[] = [];
    user.careerGoals.forEach((goal) => {
      goal.skillTargets.forEach((target) => {
        careerGoalSkills.push(target.skillName.toLowerCase());
      });
    });

    // Combine all relevant skills
    const allRelevantSkills = new Set([
      ...Object.keys(parsedUserSkills),
      ...jobSkillsRequired,
      ...careerGoalSkills,
    ]);

    // Count job appearances for each skill
    const jobSkillCounts: Record<string, number> = {};
    jobSkillsRequired.forEach((skill) => {
      jobSkillCounts[skill] = (jobSkillCounts[skill] || 0) + 1;
    });

    // Analyze each skill
    const skillAnalyses: SkillAnalysis[] = [];

    allRelevantSkills.forEach((skill) => {
      const marketData = SKILL_MARKET_DATA[skill] || {
        demand: 'medium' as const,
        avgRequired: 60,
        salaryBoost: 10,
      };

      const userLevel = parsedUserSkills[skill] || 0;
      const gap = Math.max(0, marketData.avgRequired - userLevel);

      skillAnalyses.push({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        userLevel,
        marketDemand: marketData.demand,
        averageRequired: marketData.avgRequired,
        gap,
        recommendations: getRecommendations(skill, userLevel, gap),
        relatedJobs: jobSkillCounts[skill] || 0,
        salaryImpact: marketData.salaryBoost,
      });
    });

    // Sort by gap (highest first) and then by demand
    const demandOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    skillAnalyses.sort((a, b) => {
      if (b.gap !== a.gap) return b.gap - a.gap;
      return demandOrder[b.marketDemand] - demandOrder[a.marketDemand];
    });

    // Calculate overall readiness score
    const skillsWithData = skillAnalyses.filter((s) => s.userLevel > 0);
    const overallScore = skillsWithData.length > 0
      ? Math.round(
          skillsWithData.reduce((sum, s) => sum + (s.userLevel / s.averageRequired) * 100, 0) /
          skillsWithData.length
        )
      : 0;

    // Identify top gaps and strengths
    const topGaps = skillAnalyses.filter((s) => s.gap > 0).slice(0, 5);
    const topStrengths = skillAnalyses
      .filter((s) => s.userLevel >= s.averageRequired)
      .sort((a, b) => b.userLevel - a.userLevel)
      .slice(0, 5);

    // Suggested skills to learn based on market demand
    const suggestedSkills = Object.entries(SKILL_MARKET_DATA)
      .filter(([skill]) => !parsedUserSkills[skill])
      .filter(([_, data]) => data.demand === 'critical' || data.demand === 'high')
      .sort((a, b) => b[1].salaryBoost - a[1].salaryBoost)
      .slice(0, 10)
      .map(([skill, data]) => ({
        skill: skill.charAt(0).toUpperCase() + skill.slice(1),
        demand: data.demand,
        salaryImpact: data.salaryBoost,
      }));

    return NextResponse.json({
      overallScore,
      skillAnalyses,
      topGaps,
      topStrengths,
      suggestedSkills,
      totalSkillsAnalyzed: skillAnalyses.length,
      userSkillCount: Object.keys(parsedUserSkills).length,
    });
  } catch (error) {
    console.error('[Skills Analysis] Error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze skills' },
      { status: 500 }
    );
  }
}
