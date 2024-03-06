export default class VideoUtil {
  static getVideoDuration(video: HTMLVideoElement): number {
    return video.duration;
  }

  static asTimeLabel(frame:string, fps: number, withFrames:boolean=true) {
    console.log('TODO: need FPS in query component!')
    return frame;
    //return formatAsTime(frame, this.fps, withFrames);
  }
}
