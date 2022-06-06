export namespace Hours {
  export enum Per {
    Day = 24,
  }
}

export namespace Minutes {
  export enum Per {
    Hour = 60,
    Day = 60 * Hours.Per.Day,
  }
}

export namespace Seconds {
  export enum Per {
    Minute = 60,
    Hour = 60 * Minutes.Per.Hour,
    Day = 60 * Minutes.Per.Hour * Hours.Per.Day,
  }
}

export namespace Milliseconds {
  export enum Per {
    Second = 1000,
    Minute = 1000 * Seconds.Per.Minute,
    Hour = 1000 * Seconds.Per.Minute * Minutes.Per.Hour,
    Day = 1000 * Seconds.Per.Minute * Minutes.Per.Hour * Hours.Per.Day,
  }
}

export namespace Ticks {
  export enum Per {
    Millisecond = 10000,
    Second = 10000 * Milliseconds.Per.Second,
    Minute = 10000 * Milliseconds.Per.Second * Seconds.Per.Minute,
    Hour = 10000 * Milliseconds.Per.Second * Seconds.Per.Minute * Minutes.Per.Hour,
    Day = 10000 * Milliseconds.Per.Second * Seconds.Per.Minute * Minutes.Per.Hour * Hours.Per.Day,
  }
}
