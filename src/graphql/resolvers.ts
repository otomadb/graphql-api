import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import { Context } from '../context.js';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  DateTime: any;
};

export type GetVideosInput = {
  limit?: InputMaybe<Scalars['Int']>;
  skip?: InputMaybe<Scalars['Int']>;
};

export type Mutation = {
  __typename?: 'Mutation';
  registerTag: RegisterTagPayload;
  registerVideo: RegisterVideoPayload;
  tagVideo: VideoAddTagHistoryItem;
  untagVideo: VideoDeleteTagHistoryItem;
};


export type MutationRegisterTagArgs = {
  input: RegisterTagInput;
};


export type MutationRegisterVideoArgs = {
  input: RegisterVideoInput;
};


export type MutationTagVideoArgs = {
  input: TagVideoInput;
};


export type MutationUntagVideoArgs = {
  input: UntagVideoInput;
};

export type NiconicoSource = {
  __typename?: 'NiconicoSource';
  id: Scalars['ID'];
  video?: Maybe<Video>;
};

export type NiconicoVideoSource = VideoSource & {
  __typename?: 'NiconicoVideoSource';
  url: Scalars['String'];
  videoId: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  findNiconicoSource?: Maybe<NiconicoSource>;
  niconicoSource: NiconicoSource;
  searchTags: SearchTagsResult;
  searchVideos: SearchVideosResult;
  tag: Tag;
  user: User;
  video: Video;
  videos: VideoCollection;
  whoami: User;
};


export type QueryFindNiconicoSourceArgs = {
  id: Scalars['ID'];
};


export type QueryNiconicoSourceArgs = {
  id: Scalars['ID'];
};


export type QuerySearchTagsArgs = {
  limit?: Scalars['Int'];
  query: Scalars['String'];
  skip?: Scalars['Int'];
};


export type QuerySearchVideosArgs = {
  limit?: Scalars['Int'];
  query: Scalars['String'];
  skip?: Scalars['Int'];
};


export type QueryTagArgs = {
  id: Scalars['ID'];
};


export type QueryUserArgs = {
  name: Scalars['String'];
};


export type QueryVideoArgs = {
  id: Scalars['ID'];
};


export type QueryVideosArgs = {
  input?: InputMaybe<GetVideosInput>;
};

export type RegisterTagInput = {
  explicitParent?: InputMaybe<Scalars['ID']>;
  extraNames?: InputMaybe<Array<Scalars['String']>>;
  implicitParents?: InputMaybe<Array<Scalars['ID']>>;
  primaryName: Scalars['String'];
};

export type RegisterTagPayload = {
  __typename?: 'RegisterTagPayload';
  tag: Tag;
};

export type RegisterVideoInput = {
  extraTitles?: InputMaybe<Array<Scalars['String']>>;
  primaryThumbnail: Scalars['String'];
  primaryTitle: Scalars['String'];
  sources: Array<RegisterVideoInputSource>;
  tags: Array<Scalars['ID']>;
};

export type RegisterVideoInputSource = {
  sourceId: Scalars['String'];
  type: RegisterVideoInputSourceType;
};

export enum RegisterVideoInputSourceType {
  Nicovideo = 'NICOVIDEO'
}

export type RegisterVideoPayload = {
  __typename?: 'RegisterVideoPayload';
  video: Video;
};

export type SearchTagsResult = {
  __typename?: 'SearchTagsResult';
  result: Array<SearchTagsResultItem>;
};

export type SearchTagsResultItem = {
  __typename?: 'SearchTagsResultItem';
  matchedName: Scalars['String'];
  tag: Tag;
};

export type SearchVideosResult = {
  __typename?: 'SearchVideosResult';
  result: Array<SearchVideosResultItem>;
};

export type SearchVideosResultItem = {
  __typename?: 'SearchVideosResultItem';
  matchedTitle: Scalars['String'];
  video: Video;
};

export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Tag = {
  __typename?: 'Tag';
  explicitParent?: Maybe<Tag>;
  history: Array<TagHistoryItem>;
  id: Scalars['ID'];
  meaningless: Scalars['Boolean'];
  name: Scalars['String'];
  names: Array<TagName>;
  parents: Array<TagParent>;
  taggedVideos: Array<Video>;
  /** @deprecated Field no longer supported */
  type: TagType;
};

export type TagAddNameHistoryItem = TagHistoryItem & {
  __typename?: 'TagAddNameHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  name: Scalars['String'];
  tag: Tag;
  user: User;
};

export type TagChangePrimaryNameHistoryItem = TagHistoryItem & {
  __typename?: 'TagChangePrimaryNameHistoryItem';
  createdAt: Scalars['DateTime'];
  from?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  tag: Tag;
  to: Scalars['String'];
  user: User;
};

export type TagDeleteNameHistoryItem = TagHistoryItem & {
  __typename?: 'TagDeleteNameHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  name: Scalars['String'];
  tag: Tag;
  user: User;
};

export type TagHistoryItem = {
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  user: User;
};

export type TagName = {
  __typename?: 'TagName';
  name: Scalars['String'];
  primary: Scalars['Boolean'];
};

export type TagParent = {
  __typename?: 'TagParent';
  explicit: Scalars['Boolean'];
  tag: Tag;
};

export type TagRegisterHistoryItem = TagHistoryItem & {
  __typename?: 'TagRegisterHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  tag: Tag;
  user: User;
};

export enum TagType {
  Class = 'CLASS',
  Copyright = 'COPYRIGHT',
  Event = 'EVENT',
  Image = 'IMAGE',
  Material = 'MATERIAL',
  Music = 'MUSIC',
  Series = 'SERIES',
  Tactics = 'TACTICS'
}

export type TagVideoInput = {
  tagId: Scalars['ID'];
  videoId: Scalars['ID'];
};

export type UntagVideoInput = {
  tagId: Scalars['ID'];
  videoId: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  displayName: Scalars['String'];
  icon: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type Video = {
  __typename?: 'Video';
  hasTag: Scalars['Boolean'];
  history: Array<VideoHistoryItem>;
  id: Scalars['ID'];
  registeredAt: Scalars['DateTime'];
  tags: Array<Tag>;
  thumbnailUrl: Scalars['String'];
  thumbnails: Array<VideoThumbnail>;
  title: Scalars['String'];
  titles: Array<VideoTitle>;
};


export type VideoHasTagArgs = {
  id: Scalars['ID'];
};


export type VideoHistoryArgs = {
  limit?: Scalars['Int'];
  order?: VideoHistoryOrder;
  skip?: Scalars['Int'];
};

export type VideoAddNiconicoSourceHistoryItem = VideoHistoryItem & {
  __typename?: 'VideoAddNiconicoSourceHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  niconico: NiconicoSource;
  user: User;
  video: Video;
};

export type VideoAddTagHistoryItem = VideoHistoryItem & {
  __typename?: 'VideoAddTagHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  tag: Tag;
  user: User;
  video: Video;
};

export type VideoAddThumbnailHistoryItem = VideoHistoryItem & {
  __typename?: 'VideoAddThumbnailHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  thumbnail: Scalars['String'];
  user: User;
  video: Video;
};

export type VideoAddTitleHistoryItem = VideoHistoryItem & {
  __typename?: 'VideoAddTitleHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  title: Scalars['String'];
  user: User;
  video: Video;
};

export type VideoChangePrimaryThumbnailHistoryItem = VideoHistoryItem & {
  __typename?: 'VideoChangePrimaryThumbnailHistoryItem';
  createdAt: Scalars['DateTime'];
  from?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  to: Scalars['String'];
  user: User;
  video: Video;
};

export type VideoChangePrimaryTitleHistoryItem = VideoHistoryItem & {
  __typename?: 'VideoChangePrimaryTitleHistoryItem';
  createdAt: Scalars['DateTime'];
  from?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  to: Scalars['String'];
  user: User;
  video: Video;
};

export type VideoCollection = {
  __typename?: 'VideoCollection';
  nodes: Array<Video>;
};

export type VideoDeleteTagHistoryItem = VideoHistoryItem & {
  __typename?: 'VideoDeleteTagHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  tag: Tag;
  user: User;
  video: Video;
};

export type VideoDeleteThumbnailHistoryItem = VideoHistoryItem & {
  __typename?: 'VideoDeleteThumbnailHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  thumbnail: Scalars['String'];
  user: User;
  video: Video;
};

export type VideoDeleteTitleHistoryItem = VideoHistoryItem & {
  __typename?: 'VideoDeleteTitleHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  title: Scalars['String'];
  user: User;
  video: Video;
};

export type VideoHistoryItem = {
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  user: User;
  video: Video;
};

export type VideoHistoryOrder = {
  createdAt?: InputMaybe<SortOrder>;
};

export type VideoRegisterHistoryItem = VideoHistoryItem & {
  __typename?: 'VideoRegisterHistoryItem';
  createdAt: Scalars['DateTime'];
  id: Scalars['ID'];
  user: User;
  video: Video;
};

export type VideoSource = {
  url: Scalars['String'];
  videoId: Scalars['String'];
};

export type VideoThumbnail = {
  __typename?: 'VideoThumbnail';
  imageUrl: Scalars['String'];
  primary: Scalars['Boolean'];
};

export type VideoTitle = {
  __typename?: 'VideoTitle';
  primary: Scalars['Boolean'];
  title: Scalars['String'];
};

export type YoutubeVideoSource = VideoSource & {
  __typename?: 'YoutubeVideoSource';
  url: Scalars['String'];
  videoId: Scalars['String'];
};



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  DateTime: ResolverTypeWrapper<Scalars['DateTime']>;
  GetVideosInput: GetVideosInput;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  NiconicoSource: ResolverTypeWrapper<NiconicoSource>;
  NiconicoVideoSource: ResolverTypeWrapper<NiconicoVideoSource>;
  Query: ResolverTypeWrapper<{}>;
  RegisterTagInput: RegisterTagInput;
  RegisterTagPayload: ResolverTypeWrapper<RegisterTagPayload>;
  RegisterVideoInput: RegisterVideoInput;
  RegisterVideoInputSource: RegisterVideoInputSource;
  RegisterVideoInputSourceType: RegisterVideoInputSourceType;
  RegisterVideoPayload: ResolverTypeWrapper<RegisterVideoPayload>;
  SearchTagsResult: ResolverTypeWrapper<SearchTagsResult>;
  SearchTagsResultItem: ResolverTypeWrapper<SearchTagsResultItem>;
  SearchVideosResult: ResolverTypeWrapper<SearchVideosResult>;
  SearchVideosResultItem: ResolverTypeWrapper<SearchVideosResultItem>;
  SortOrder: SortOrder;
  String: ResolverTypeWrapper<Scalars['String']>;
  Tag: ResolverTypeWrapper<Tag>;
  TagAddNameHistoryItem: ResolverTypeWrapper<TagAddNameHistoryItem>;
  TagChangePrimaryNameHistoryItem: ResolverTypeWrapper<TagChangePrimaryNameHistoryItem>;
  TagDeleteNameHistoryItem: ResolverTypeWrapper<TagDeleteNameHistoryItem>;
  TagHistoryItem: ResolversTypes['TagAddNameHistoryItem'] | ResolversTypes['TagChangePrimaryNameHistoryItem'] | ResolversTypes['TagDeleteNameHistoryItem'] | ResolversTypes['TagRegisterHistoryItem'];
  TagName: ResolverTypeWrapper<TagName>;
  TagParent: ResolverTypeWrapper<TagParent>;
  TagRegisterHistoryItem: ResolverTypeWrapper<TagRegisterHistoryItem>;
  TagType: TagType;
  TagVideoInput: TagVideoInput;
  UntagVideoInput: UntagVideoInput;
  User: ResolverTypeWrapper<User>;
  Video: ResolverTypeWrapper<Video>;
  VideoAddNiconicoSourceHistoryItem: ResolverTypeWrapper<VideoAddNiconicoSourceHistoryItem>;
  VideoAddTagHistoryItem: ResolverTypeWrapper<VideoAddTagHistoryItem>;
  VideoAddThumbnailHistoryItem: ResolverTypeWrapper<VideoAddThumbnailHistoryItem>;
  VideoAddTitleHistoryItem: ResolverTypeWrapper<VideoAddTitleHistoryItem>;
  VideoChangePrimaryThumbnailHistoryItem: ResolverTypeWrapper<VideoChangePrimaryThumbnailHistoryItem>;
  VideoChangePrimaryTitleHistoryItem: ResolverTypeWrapper<VideoChangePrimaryTitleHistoryItem>;
  VideoCollection: ResolverTypeWrapper<VideoCollection>;
  VideoDeleteTagHistoryItem: ResolverTypeWrapper<VideoDeleteTagHistoryItem>;
  VideoDeleteThumbnailHistoryItem: ResolverTypeWrapper<VideoDeleteThumbnailHistoryItem>;
  VideoDeleteTitleHistoryItem: ResolverTypeWrapper<VideoDeleteTitleHistoryItem>;
  VideoHistoryItem: ResolversTypes['VideoAddNiconicoSourceHistoryItem'] | ResolversTypes['VideoAddTagHistoryItem'] | ResolversTypes['VideoAddThumbnailHistoryItem'] | ResolversTypes['VideoAddTitleHistoryItem'] | ResolversTypes['VideoChangePrimaryThumbnailHistoryItem'] | ResolversTypes['VideoChangePrimaryTitleHistoryItem'] | ResolversTypes['VideoDeleteTagHistoryItem'] | ResolversTypes['VideoDeleteThumbnailHistoryItem'] | ResolversTypes['VideoDeleteTitleHistoryItem'] | ResolversTypes['VideoRegisterHistoryItem'];
  VideoHistoryOrder: VideoHistoryOrder;
  VideoRegisterHistoryItem: ResolverTypeWrapper<VideoRegisterHistoryItem>;
  VideoSource: ResolversTypes['NiconicoVideoSource'] | ResolversTypes['YoutubeVideoSource'];
  VideoThumbnail: ResolverTypeWrapper<VideoThumbnail>;
  VideoTitle: ResolverTypeWrapper<VideoTitle>;
  YoutubeVideoSource: ResolverTypeWrapper<YoutubeVideoSource>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  DateTime: Scalars['DateTime'];
  GetVideosInput: GetVideosInput;
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Mutation: {};
  NiconicoSource: NiconicoSource;
  NiconicoVideoSource: NiconicoVideoSource;
  Query: {};
  RegisterTagInput: RegisterTagInput;
  RegisterTagPayload: RegisterTagPayload;
  RegisterVideoInput: RegisterVideoInput;
  RegisterVideoInputSource: RegisterVideoInputSource;
  RegisterVideoPayload: RegisterVideoPayload;
  SearchTagsResult: SearchTagsResult;
  SearchTagsResultItem: SearchTagsResultItem;
  SearchVideosResult: SearchVideosResult;
  SearchVideosResultItem: SearchVideosResultItem;
  String: Scalars['String'];
  Tag: Tag;
  TagAddNameHistoryItem: TagAddNameHistoryItem;
  TagChangePrimaryNameHistoryItem: TagChangePrimaryNameHistoryItem;
  TagDeleteNameHistoryItem: TagDeleteNameHistoryItem;
  TagHistoryItem: ResolversParentTypes['TagAddNameHistoryItem'] | ResolversParentTypes['TagChangePrimaryNameHistoryItem'] | ResolversParentTypes['TagDeleteNameHistoryItem'] | ResolversParentTypes['TagRegisterHistoryItem'];
  TagName: TagName;
  TagParent: TagParent;
  TagRegisterHistoryItem: TagRegisterHistoryItem;
  TagVideoInput: TagVideoInput;
  UntagVideoInput: UntagVideoInput;
  User: User;
  Video: Video;
  VideoAddNiconicoSourceHistoryItem: VideoAddNiconicoSourceHistoryItem;
  VideoAddTagHistoryItem: VideoAddTagHistoryItem;
  VideoAddThumbnailHistoryItem: VideoAddThumbnailHistoryItem;
  VideoAddTitleHistoryItem: VideoAddTitleHistoryItem;
  VideoChangePrimaryThumbnailHistoryItem: VideoChangePrimaryThumbnailHistoryItem;
  VideoChangePrimaryTitleHistoryItem: VideoChangePrimaryTitleHistoryItem;
  VideoCollection: VideoCollection;
  VideoDeleteTagHistoryItem: VideoDeleteTagHistoryItem;
  VideoDeleteThumbnailHistoryItem: VideoDeleteThumbnailHistoryItem;
  VideoDeleteTitleHistoryItem: VideoDeleteTitleHistoryItem;
  VideoHistoryItem: ResolversParentTypes['VideoAddNiconicoSourceHistoryItem'] | ResolversParentTypes['VideoAddTagHistoryItem'] | ResolversParentTypes['VideoAddThumbnailHistoryItem'] | ResolversParentTypes['VideoAddTitleHistoryItem'] | ResolversParentTypes['VideoChangePrimaryThumbnailHistoryItem'] | ResolversParentTypes['VideoChangePrimaryTitleHistoryItem'] | ResolversParentTypes['VideoDeleteTagHistoryItem'] | ResolversParentTypes['VideoDeleteThumbnailHistoryItem'] | ResolversParentTypes['VideoDeleteTitleHistoryItem'] | ResolversParentTypes['VideoRegisterHistoryItem'];
  VideoHistoryOrder: VideoHistoryOrder;
  VideoRegisterHistoryItem: VideoRegisterHistoryItem;
  VideoSource: ResolversParentTypes['NiconicoVideoSource'] | ResolversParentTypes['YoutubeVideoSource'];
  VideoThumbnail: VideoThumbnail;
  VideoTitle: VideoTitle;
  YoutubeVideoSource: YoutubeVideoSource;
};

export interface DateTimeScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['DateTime'], any> {
  name: 'DateTime';
}

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  registerTag?: Resolver<ResolversTypes['RegisterTagPayload'], ParentType, ContextType, RequireFields<MutationRegisterTagArgs, 'input'>>;
  registerVideo?: Resolver<ResolversTypes['RegisterVideoPayload'], ParentType, ContextType, RequireFields<MutationRegisterVideoArgs, 'input'>>;
  tagVideo?: Resolver<ResolversTypes['VideoAddTagHistoryItem'], ParentType, ContextType, RequireFields<MutationTagVideoArgs, 'input'>>;
  untagVideo?: Resolver<ResolversTypes['VideoDeleteTagHistoryItem'], ParentType, ContextType, RequireFields<MutationUntagVideoArgs, 'input'>>;
};

export type NiconicoSourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NiconicoSource'] = ResolversParentTypes['NiconicoSource']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  video?: Resolver<Maybe<ResolversTypes['Video']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type NiconicoVideoSourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['NiconicoVideoSource'] = ResolversParentTypes['NiconicoVideoSource']> = {
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  videoId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  findNiconicoSource?: Resolver<Maybe<ResolversTypes['NiconicoSource']>, ParentType, ContextType, RequireFields<QueryFindNiconicoSourceArgs, 'id'>>;
  niconicoSource?: Resolver<ResolversTypes['NiconicoSource'], ParentType, ContextType, RequireFields<QueryNiconicoSourceArgs, 'id'>>;
  searchTags?: Resolver<ResolversTypes['SearchTagsResult'], ParentType, ContextType, RequireFields<QuerySearchTagsArgs, 'limit' | 'query' | 'skip'>>;
  searchVideos?: Resolver<ResolversTypes['SearchVideosResult'], ParentType, ContextType, RequireFields<QuerySearchVideosArgs, 'limit' | 'query' | 'skip'>>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType, RequireFields<QueryTagArgs, 'id'>>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType, RequireFields<QueryUserArgs, 'name'>>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType, RequireFields<QueryVideoArgs, 'id'>>;
  videos?: Resolver<ResolversTypes['VideoCollection'], ParentType, ContextType, RequireFields<QueryVideosArgs, 'input'>>;
  whoami?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
};

export type RegisterTagPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RegisterTagPayload'] = ResolversParentTypes['RegisterTagPayload']> = {
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RegisterVideoPayloadResolvers<ContextType = Context, ParentType extends ResolversParentTypes['RegisterVideoPayload'] = ResolversParentTypes['RegisterVideoPayload']> = {
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchTagsResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SearchTagsResult'] = ResolversParentTypes['SearchTagsResult']> = {
  result?: Resolver<Array<ResolversTypes['SearchTagsResultItem']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchTagsResultItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SearchTagsResultItem'] = ResolversParentTypes['SearchTagsResultItem']> = {
  matchedName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchVideosResultResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SearchVideosResult'] = ResolversParentTypes['SearchVideosResult']> = {
  result?: Resolver<Array<ResolversTypes['SearchVideosResultItem']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchVideosResultItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['SearchVideosResultItem'] = ResolversParentTypes['SearchVideosResultItem']> = {
  matchedTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Tag'] = ResolversParentTypes['Tag']> = {
  explicitParent?: Resolver<Maybe<ResolversTypes['Tag']>, ParentType, ContextType>;
  history?: Resolver<Array<ResolversTypes['TagHistoryItem']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  meaningless?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  names?: Resolver<Array<ResolversTypes['TagName']>, ParentType, ContextType>;
  parents?: Resolver<Array<ResolversTypes['TagParent']>, ParentType, ContextType>;
  taggedVideos?: Resolver<Array<ResolversTypes['Video']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['TagType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagAddNameHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagAddNameHistoryItem'] = ResolversParentTypes['TagAddNameHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagChangePrimaryNameHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagChangePrimaryNameHistoryItem'] = ResolversParentTypes['TagChangePrimaryNameHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  from?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagDeleteNameHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagDeleteNameHistoryItem'] = ResolversParentTypes['TagDeleteNameHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagHistoryItem'] = ResolversParentTypes['TagHistoryItem']> = {
  __resolveType: TypeResolveFn<'TagAddNameHistoryItem' | 'TagChangePrimaryNameHistoryItem' | 'TagDeleteNameHistoryItem' | 'TagRegisterHistoryItem', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
};

export type TagNameResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagName'] = ResolversParentTypes['TagName']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagParentResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagParent'] = ResolversParentTypes['TagParent']> = {
  explicit?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TagRegisterHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['TagRegisterHistoryItem'] = ResolversParentTypes['TagRegisterHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  displayName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  icon?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Video'] = ResolversParentTypes['Video']> = {
  hasTag?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<VideoHasTagArgs, 'id'>>;
  history?: Resolver<Array<ResolversTypes['VideoHistoryItem']>, ParentType, ContextType, RequireFields<VideoHistoryArgs, 'limit' | 'order' | 'skip'>>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  registeredAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  tags?: Resolver<Array<ResolversTypes['Tag']>, ParentType, ContextType>;
  thumbnailUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thumbnails?: Resolver<Array<ResolversTypes['VideoThumbnail']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  titles?: Resolver<Array<ResolversTypes['VideoTitle']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoAddNiconicoSourceHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoAddNiconicoSourceHistoryItem'] = ResolversParentTypes['VideoAddNiconicoSourceHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  niconico?: Resolver<ResolversTypes['NiconicoSource'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoAddTagHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoAddTagHistoryItem'] = ResolversParentTypes['VideoAddTagHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoAddThumbnailHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoAddThumbnailHistoryItem'] = ResolversParentTypes['VideoAddThumbnailHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  thumbnail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoAddTitleHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoAddTitleHistoryItem'] = ResolversParentTypes['VideoAddTitleHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoChangePrimaryThumbnailHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoChangePrimaryThumbnailHistoryItem'] = ResolversParentTypes['VideoChangePrimaryThumbnailHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  from?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoChangePrimaryTitleHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoChangePrimaryTitleHistoryItem'] = ResolversParentTypes['VideoChangePrimaryTitleHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  from?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  to?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoCollectionResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoCollection'] = ResolversParentTypes['VideoCollection']> = {
  nodes?: Resolver<Array<ResolversTypes['Video']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoDeleteTagHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoDeleteTagHistoryItem'] = ResolversParentTypes['VideoDeleteTagHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  tag?: Resolver<ResolversTypes['Tag'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoDeleteThumbnailHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoDeleteThumbnailHistoryItem'] = ResolversParentTypes['VideoDeleteThumbnailHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  thumbnail?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoDeleteTitleHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoDeleteTitleHistoryItem'] = ResolversParentTypes['VideoDeleteTitleHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoHistoryItem'] = ResolversParentTypes['VideoHistoryItem']> = {
  __resolveType: TypeResolveFn<'VideoAddNiconicoSourceHistoryItem' | 'VideoAddTagHistoryItem' | 'VideoAddThumbnailHistoryItem' | 'VideoAddTitleHistoryItem' | 'VideoChangePrimaryThumbnailHistoryItem' | 'VideoChangePrimaryTitleHistoryItem' | 'VideoDeleteTagHistoryItem' | 'VideoDeleteThumbnailHistoryItem' | 'VideoDeleteTitleHistoryItem' | 'VideoRegisterHistoryItem', ParentType, ContextType>;
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
};

export type VideoRegisterHistoryItemResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoRegisterHistoryItem'] = ResolversParentTypes['VideoRegisterHistoryItem']> = {
  createdAt?: Resolver<ResolversTypes['DateTime'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
  video?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoSourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoSource'] = ResolversParentTypes['VideoSource']> = {
  __resolveType: TypeResolveFn<'NiconicoVideoSource' | 'YoutubeVideoSource', ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  videoId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type VideoThumbnailResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoThumbnail'] = ResolversParentTypes['VideoThumbnail']> = {
  imageUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  primary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoTitleResolvers<ContextType = Context, ParentType extends ResolversParentTypes['VideoTitle'] = ResolversParentTypes['VideoTitle']> = {
  primary?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type YoutubeVideoSourceResolvers<ContextType = Context, ParentType extends ResolversParentTypes['YoutubeVideoSource'] = ResolversParentTypes['YoutubeVideoSource']> = {
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  videoId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  DateTime?: GraphQLScalarType;
  Mutation?: MutationResolvers<ContextType>;
  NiconicoSource?: NiconicoSourceResolvers<ContextType>;
  NiconicoVideoSource?: NiconicoVideoSourceResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  RegisterTagPayload?: RegisterTagPayloadResolvers<ContextType>;
  RegisterVideoPayload?: RegisterVideoPayloadResolvers<ContextType>;
  SearchTagsResult?: SearchTagsResultResolvers<ContextType>;
  SearchTagsResultItem?: SearchTagsResultItemResolvers<ContextType>;
  SearchVideosResult?: SearchVideosResultResolvers<ContextType>;
  SearchVideosResultItem?: SearchVideosResultItemResolvers<ContextType>;
  Tag?: TagResolvers<ContextType>;
  TagAddNameHistoryItem?: TagAddNameHistoryItemResolvers<ContextType>;
  TagChangePrimaryNameHistoryItem?: TagChangePrimaryNameHistoryItemResolvers<ContextType>;
  TagDeleteNameHistoryItem?: TagDeleteNameHistoryItemResolvers<ContextType>;
  TagHistoryItem?: TagHistoryItemResolvers<ContextType>;
  TagName?: TagNameResolvers<ContextType>;
  TagParent?: TagParentResolvers<ContextType>;
  TagRegisterHistoryItem?: TagRegisterHistoryItemResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  Video?: VideoResolvers<ContextType>;
  VideoAddNiconicoSourceHistoryItem?: VideoAddNiconicoSourceHistoryItemResolvers<ContextType>;
  VideoAddTagHistoryItem?: VideoAddTagHistoryItemResolvers<ContextType>;
  VideoAddThumbnailHistoryItem?: VideoAddThumbnailHistoryItemResolvers<ContextType>;
  VideoAddTitleHistoryItem?: VideoAddTitleHistoryItemResolvers<ContextType>;
  VideoChangePrimaryThumbnailHistoryItem?: VideoChangePrimaryThumbnailHistoryItemResolvers<ContextType>;
  VideoChangePrimaryTitleHistoryItem?: VideoChangePrimaryTitleHistoryItemResolvers<ContextType>;
  VideoCollection?: VideoCollectionResolvers<ContextType>;
  VideoDeleteTagHistoryItem?: VideoDeleteTagHistoryItemResolvers<ContextType>;
  VideoDeleteThumbnailHistoryItem?: VideoDeleteThumbnailHistoryItemResolvers<ContextType>;
  VideoDeleteTitleHistoryItem?: VideoDeleteTitleHistoryItemResolvers<ContextType>;
  VideoHistoryItem?: VideoHistoryItemResolvers<ContextType>;
  VideoRegisterHistoryItem?: VideoRegisterHistoryItemResolvers<ContextType>;
  VideoSource?: VideoSourceResolvers<ContextType>;
  VideoThumbnail?: VideoThumbnailResolvers<ContextType>;
  VideoTitle?: VideoTitleResolvers<ContextType>;
  YoutubeVideoSource?: YoutubeVideoSourceResolvers<ContextType>;
};

