import { getProfileByUsername, getUserLikedPosts, getUserPosts, isFollowing } from '@/actions/profile.action'
import { notFound } from 'next/navigation';
import React from 'react'
import ProfilePageClient from './ProfilePageClient';

export async function generateMetadata({params}:{params: {username:string}}) {
	const user = await getProfileByUsername(params.username);
	if(!user) return;
	
	return{
		title: `${user.username} ?? ${user.name}`,
		description: user.bio || `Check out ${user.username}'s profile.`,
	}
}

async function ProfilePageServerComponent({params}: {params: {username: string}}) {
	const user = await getProfileByUsername(params.username);

	if(!user) notFound();

	const [posts, likedPosts, isCurrenUserFollowing] = await Promise.all([
		getUserPosts(user.id),
		getUserLikedPosts(user.id),
		isFollowing(user.id),
	])
	
	return (
		<ProfilePageClient
		user = {user}
		posts = {posts}
		likedPosts = {likedPosts}
		isFollowing = {isCurrenUserFollowing}
		></ProfilePageClient>
	)
}

export default ProfilePageServerComponent