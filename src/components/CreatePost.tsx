"use client"

import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarImage } from './ui/avatar';

function CreatePost() {

    const {user} = useUser();

    const [content, selfContent] = useState("");
    const [imageUrl, selfImageUrl] = useState("");
    const [isPosting, setIsPosting] = useState(false);
    const [showImageUpload, setImageUpload] = useState(false);

    const handleSubmit = async () => {}

  return (
    <></>
  )
}

export default CreatePost