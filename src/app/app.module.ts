import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { GamePage } from '../pages/game/game';
import { ScoresPage } from '../pages/scores/scores';
import { SettingsPage } from '../pages/settings/settings';
import { PopoverPage } from '../pages/scores/popover';
import { PopoverSettingsPage } from '../pages/settings/popover';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { Network } from '@ionic-native/network';
import { Diagnostic } from '@ionic-native/diagnostic'
import { SocialSharing } from '@ionic-native/social-sharing';

import { User } from '../providers/user';
import { NetworkService } from '../providers/network-service';

@NgModule({
	declarations: [
		MyApp,
		HomePage,
		GamePage,
		ScoresPage,
		SettingsPage,
		PopoverPage,
		PopoverSettingsPage
	],
	imports: [
		BrowserModule,
		IonicModule.forRoot(MyApp),
		IonicStorageModule.forRoot()
	],
	bootstrap: [IonicApp],
	entryComponents: [
		MyApp,
		HomePage,
		GamePage,
		ScoresPage,
		SettingsPage,
		PopoverPage,
		PopoverSettingsPage
	],
	providers: [
		StatusBar,
		SplashScreen,
		Network,
		Diagnostic,
		SocialSharing,
		{ provide: ErrorHandler, useClass: IonicErrorHandler },
		User,
		NetworkService
	]
})
export class AppModule { }
