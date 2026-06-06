export interface SetAvailableCommand {
  profileId: number;
  isAvailable: boolean;
}

export interface SetOnlineOfflineCommand {
  profileId: number;
  isOnline: boolean;
}

export interface ConsultantStatusSnapshot {
  profileId: number;
  isAvailable: boolean;
  isOnline: boolean;
}

export interface ConsultantStatusState extends ConsultantStatusSnapshot {
  isLoading: boolean;
  isSubmittingAvailable: boolean;
  isSubmittingOnline: boolean;
}

export type ConsultantStatusApiData = Partial<ConsultantStatusSnapshot> & {
  ProfileId?: number;
  IsAvailable?: boolean;
  IsOnline?: boolean;
};

export interface ConsultantStatusApiResult {
  isSuccess?: boolean;
  IsSuccess?: boolean;
  message?: string;
  Message?: string;
  data?: ConsultantStatusApiData | null;
  Data?: ConsultantStatusApiData | null;
}
