import { Doc } from '../../convex/_generated/dataModel'

export type UserDoc = Doc<'users'>

export type SocialMedia = NonNullable<UserDoc['socialMedia']>

export type BasicProfileFields = Pick<UserDoc, 'firstName' | 'lastName' | 'imageUrl' | 'profileCompletionStep'> & {
  socialMedia: SocialMedia
}

export type ProfileUpdate = Partial<
  Pick<UserDoc, 'firstName' | 'lastName' | 'imageUrl' | 'socialMedia' | 'interests' | 'profileCompletionStep'>
>


