//By default every component is a server component by default

import CreatePost from "@/components/CreatePost";
import WhoToFollow from "@/components/WhoToFollow";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  
  const user = await currentUser();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {user ? <CreatePost></CreatePost> : null}
      </div>

      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <WhoToFollow></WhoToFollow>
      </div>
    </div>
  );
}
