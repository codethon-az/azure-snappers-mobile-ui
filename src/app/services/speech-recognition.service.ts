import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CancellationDetails } from 'microsoft-cognitiveservices-speech-sdk';

@Injectable({
  providedIn: 'root'
})
export class SpeechRecognitionService {

  private sdk = require("microsoft-cognitiveservices-speech-sdk");
  private speechConfig = this.sdk.SpeechConfig.fromSubscription("10bbee5990824c33a278bf82a831acc3", "eastus");

  constructor(private http: HttpClient) {
    this.speechConfig.speechRecognitionLanguage = "en-US";
  }



  getAudio() {
    return this.http.get('/assets/schoolsNearby.wav', { responseType: 'blob' });
  }

  fromFile(this: any, audioFile: File): void {
    let audioConfig = this.sdk.AudioConfig.fromWavFileInput(audioFile);
    //let audioConfig = this.sdk.AudioConfig.fromDefaultMicrophoneInput();
    let speechRecognizer = new this.sdk.IntentRecognizer(this.speechConfig, audioConfig);
    var lm = this.sdk.LanguageUnderstandingModel.fromAppId('a659fac3-6698-4c0d-a34d-4716591d78a5');
    speechRecognizer.addAllIntents(lm);
    speechRecognizer.recognizeOnceAsync(result => {
        switch (result.reason) {
          case this.sdk.ResultReason.RecognizedIntent:
            console.log(`RECOGNIZED: Text=${result.text} | IntentId: ${result.intentId}`);
             // The actual JSON returned from Language Understanding is a bit more complex to get to, but it is available for things like
            // the entity name and type if part of the intent.
            console.log(`Intent JSON: ${result.properties.getProperty(this.sdk.PropertyId.LanguageUnderstandingServiceResponse_JsonResult)}`);
            break;
            case this.sdk.ResultReason.RecognizedSpeech:
                console.log(`RECOGNIZED: Text=${result.text}`);
                break;
            case this.sdk.ResultReason.NoMatch:
                console.log("NOMATCH: Speech could not be recognized.");
                var noMatchDetail = this.sdk.NoMatchDetails.fromResult(result);
                console.log(`NoMatchReason:  ${this.sdk.NoMatchReason[noMatchDetail.reason]}`);
                break;
            case this.sdk.ResultReason.Canceled:
                const cancellation = CancellationDetails.fromResult(result);
                console.log(`CANCELED: Reason=${cancellation.reason}`);

                if (cancellation.reason == this.sdk.CancellationReason.Error) {
                    console.log(`CANCELED: ErrorCode=${cancellation.ErrorCode}`);
                    console.log(`CANCELED: ErrorDetails=${cancellation.errorDetails}`);
                    console.log("CANCELED: Did you update the key and location/region info?");
                }
                break;
        }    
        speechRecognizer.close();
    });
}


}
