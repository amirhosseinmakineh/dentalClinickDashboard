export interface SetAvailableCommand {
  profileId: number;
  isAvailable: boolean;
}

export interface SetOnlineOfflineCommand {
  profileId: number;
  isOnline: boolean;
}

export interface ConsultantStatusState {
  profileId: number;
  isAvailable: boolean;
  isOnline: boolean;
  isSubmittingAvailable: boolean;
  isSubmittingOnline: boolean;
}

export interface ConsultantStatusApiResult {
  isSuccess?: boolean;
  IsSuccess?: boolean;
  message?: string;
  Message?: string;
}
