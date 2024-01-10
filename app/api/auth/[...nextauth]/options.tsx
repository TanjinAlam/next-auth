import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import User from "@/app/(models)/users";

export const options = {
  providers: [
    // GitHubProvider({
    //   profile(profile: any) {
    //     console.log("Profile GitHub: ", profile);

    //     let userRole = "GitHub User";
    //     if (profile?.email == "jake@claritycoders.com") {
    //       userRole = "admin";
    //     }

    //     return {
    //       ...profile,
    //       role: userRole,
    //     };
    //   },
    //   clientId: process.env.GITHUB_ID as any,
    //   clientSecret: process.env.GITHUB_Secret as any,
    // }),
    GoogleProvider({
      profile(profile) {
        console.log("Profile Google: ", profile);

        let userRole = "admin";
        return {
          ...profile,
          id: profile.sub,
          role: userRole,
        };
      },
      clientId: process.env.GOOGLE_ID as any,
      clientSecret: process.env.GOOGLE_Secret as any,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "email:",
          type: "text",
          placeholder: "your-email",
        },
        password: {
          label: "password:",
          type: "password",
          placeholder: "your-password",
        },
      },
      async authorize(credentials: any) {
        console.log("AUTHORIZING");
        try {
          const foundUser: any = await User.findOne({
            email: credentials.email,
          })
            .lean()
            .exec();
          console.log("foundUser", foundUser);
          if (foundUser) {
            console.log("User Exists");
            const match = await bcryptjs.compare(
              credentials.password,
              foundUser.password
            );
            if (match) {
              console.log("Good Pass");
              delete foundUser.password;
              foundUser["role"] = "Unverified Email";
              return foundUser;
            }
          }
        } catch (error) {
          console.log(error);
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = user.role;
      return token;
    },
    async session({ session, token }) {
      if (session?.user) session.user.role = token.role;
      return session;
    },
  },
};
