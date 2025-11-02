/**
 * User Details Response DTO
 *
 * Defines the response structure for getting user details by ID.
 */

import { z } from 'zod';

/**
 * User details response schema
 */
export const userDetailsResponseSchema = z.object({
  name: z.string(),
  username: z.string(),
  accountStatus: z.string(),
  city: z.string(),
  feeling: z.string(),
  email: z.string(),
  mobile: z.string(),
  logo: z.string().nullable(),
  totalZiker: z.number(),
  streak: z.number(),
  highestStreak: z.number(),
  activeLoginDays: z.number(),
  joinDate: z.string().or(z.date()),
  rank: z.string(),
  inviteCode: z.string(),
  totalZikerByInvitedFriends: z.number(),
  friendsInvited: z.number(),
});

/**
 * Type inference from schema
 */
export type UserDetailsResponseDTO = z.infer<typeof userDetailsResponseSchema>;
