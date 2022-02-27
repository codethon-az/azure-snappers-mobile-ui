import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Subject, Observable, tap, catchError } from 'rxjs';
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import * as atlas from 'azure-maps-control';
import { AuthenticationType } from 'azure-maps-control';

import * as atlasRest from 'azure-maps-rest'; // install npm azure-maps-rest
import { IMapEvent } from 'ng-azure-maps';
import { HttpClient } from '@angular/common/http';
import { SpeechRecognitionService } from './services/speech-recognition.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  // toggle webcam on/off
  public showWebcam = true;
  public allowCameraSwitch = true;
  public multipleWebcamsAvailable = false;
  public deviceId: string;
  public width: number;
  public height: number;

  public longitude: number;
  public latitude: number;

  public propertyValue: number;

  public freeformAddress: string;

  public videoOptions: MediaTrackConstraints = {
    // width: {ideal: 1024},
    // height: {ideal: 576}
  };
  public errors: WebcamInitError[] = [];

  // latest snapshot
  public webcamImage: WebcamImage = null;

  // webcam snapshot trigger
  private trigger: Subject<void> = new Subject<void>();
  // switch to next / previous / specific webcam; true/false: forward/backwards, string: deviceId
  private nextWebcam: Subject<boolean | string> = new Subject<boolean | string>();


  // Azure Active Directory Authentication Client ID
  // or Shared Key Authentication KEY
  // get it from portal.azure.com
  private key: string = 'KXPqsdAHCRZM14LM1Y-Fp863ozf9tS6R4xwMAIRHtIk';
  public map: any;

  constructor(
    private http: HttpClient,
    private speechReconitionService: SpeechRecognitionService
    ) { }

  public ngOnInit(): void {
    WebcamUtil.getAvailableVideoInputs()
      .then((mediaDevices: MediaDeviceInfo[]) => {
        this.multipleWebcamsAvailable = mediaDevices && mediaDevices.length > 1;
      });

    this.width = 500;
    this.height = 800;

  }

  mapReady(event: IMapEvent) {

    this.getLocation();

    const features = [];

    event.map.markers.add(new atlas.HtmlMarker({
      position: [0, 0]
    }));
    features.push(new atlas.data.Point([this.longitude, this.latitude]));


    event.map.setCamera({
      bounds: atlas.data.BoundingBox.fromData(features)
    });

    //Create a HTML marker and add it to the map.
    var marker = new atlas.HtmlMarker({
      color: 'DodgerBlue',
      text: '10',
      position: [this.longitude, this.latitude],
      popup: new atlas.Popup({
        content: '<div style="padding:10px">Hello World</div>',
        pixelOffset: [0, -30]
      })
    });

    event.map.markers.add(marker);

    //Add a click event to toggle the popup.
    event.map.events.add('click', marker, () => {
      marker.togglePopup();
    });
  }

  ngAfterViewInit(): void {
    this.getLocation();
    console.info(this.latitude)
  }

  public triggerSnapshot(): void {
    this.trigger.next();
    this.getLocation();
    this.getAddress();
    this.propertyValue = Math.floor(Math.random() * 800000);
  }

  public triggerTalk(): void {
    this.speechReconitionService.getAudio()
    .subscribe((data: any) => {
      const file = new File([data], 'schoolsNearBy.wav');
      this.speechReconitionService.fromFile(file);
    });
  }

  public toggleWebcam(): void {
    this.showWebcam = !this.showWebcam;
  }

  public handleInitError(error: WebcamInitError): void {
    this.errors.push(error);
  }

  public showNextWebcam(directionOrDeviceId: boolean | string): void {
    // true => move forward through devices
    // false => move backwards through devices
    // string => move to device with given deviceId
    this.nextWebcam.next(directionOrDeviceId);
  }

  public handleImage(webcamImage: WebcamImage): void {
    console.info('received webcam image', webcamImage);
    this.webcamImage = webcamImage;
  }

  public cameraWasSwitched(deviceId: string): void {
    console.log('active device: ' + deviceId);
    this.deviceId = deviceId;
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public get nextWebcamObservable(): Observable<boolean | string> {
    return this.nextWebcam.asObservable();
  }


  getLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        this.longitude = position.coords.longitude;
        this.latitude = position.coords.latitude;
        this.callApi(this.longitude, this.latitude);
      });
    } else {
      console.log("No support for geolocation")
    }
  }

  getAddress() {
    const searchAddressURL = `https://atlas.microsoft.com/search/address/reverse/json?api-version=1.0&subscription-key=${this.key}&language=en-US&query=${this.latitude},${this.longitude}`;
    // console.info(searchAddressURL);
      return this.http.get<any>(searchAddressURL).pipe(
        tap(_ => console.info('fetched heroes')),
        //tap(data => this.freeformAddress = data.addresses[0].address.freeformAddress       )
      ).subscribe((data)=> {
        console.info(data);
        this.freeformAddress = data.addresses[0].address.freeformAddress
      })
  }


  showAddress() {
    /*
    this.configService.getConfig()
      .subscribe((data: Config) => this.config = {
          heroesUrl: data.heroesUrl,
          textfile:  data.textfile,
          date: data.date,
      });
      */
  }


  callApi(Longitude: number, Latitude: number) {
    const url = `https://api-adresse.data.gouv.fr/reverse/?lon=${Longitude}&lat=${Latitude}`
    //Call API
  }

}