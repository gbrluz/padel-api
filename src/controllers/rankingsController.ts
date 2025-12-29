import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { getSupabase } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { Player } from 'climb-types';

const supabase = getSupabase();

export async function getRegionalRanking(req: AuthRequest, res: Response) {
  const { state, city, gender, category } = req.query;

  let query = supabase
    .from('players')
    .select('id, full_name, state, city, gender, category, ranking_points, total_matches, total_wins')
    .order('ranking_points', { ascending: false });

  if (state) query = query.eq('state', state);
  if (city) query = query.eq('city', city);
  if (gender) query = query.eq('gender', gender);
  if (category) query = query.eq('category', category);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching regional ranking:', error);
    throw new AppError(500, 'Failed to fetch regional ranking');
  }

const ranking = data?.map((player: any, index: number) => {
  const p = player as Player;
  return {
    ...p,
    position: index + 1,
    fullName: p.full_name,
    rankingPoints: p.ranking_points,
    totalMatches: p.total_matches,
    totalWins: p.total_wins,
    playerId: p.id
  };
}) || [];

  res.json({ ranking });
}

export async function getGlobalRanking(req: AuthRequest, res: Response) {
  const { gender } = req.query;

  let query = supabase
    .from('players')
    .select('id, full_name, state, city, category, ranking_points, global_ranking_points')
    .order('global_ranking_points', { ascending: false });

  if (gender) query = query.eq('gender', gender);

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching global ranking:', error);
    throw new AppError(500, 'Failed to fetch global ranking');
  }

  const ranking = data?.map((player, index) => ({
    playerId: player.id,
    fullName: player.full_name,
    state: player.state,
    city: player.city,
    category: player.category,
    regionalPoints: player.ranking_points,
    globalPoints: player.global_ranking_points,
    globalPosition: index + 1,
    regionalPosition: 0
  })) || [];

  res.json({ ranking });
}

export async function getRankingHistory(req: AuthRequest, res: Response) {
  const { playerId } = req.params;
  const userId = playerId || req.userId!;

  const { data: history, error } = await supabase
    .from('ranking_history')
    .select('*')
    .eq('player_id', userId)
    .order('recorded_at', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching ranking history:', error);
    throw new AppError(500, 'Failed to fetch ranking history');
  }

  res.json({ history });
}
