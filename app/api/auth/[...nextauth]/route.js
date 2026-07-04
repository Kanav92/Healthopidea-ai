import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectDB from "@lib/mongodb";
import User from "@models/User";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      try {
        await connectDB();
        const sessionUser = await User.findOne({ email: session.user.email });
        if (sessionUser) session.user.id = sessionUser._id.toString();
      } catch (error) {
        console.log("Session error:", error);
      }
      return session;
    },
    async signIn({ profile }) {
      try {
        await connectDB();
        const userExists = await User.findOne({ email: profile.email });
        if (!userExists) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(/\s+/g, "").toLowerCase(),
            image: profile.picture,
          });
        }
        return true;
      } catch (error) {
        console.log("Sign in error:", error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
