import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: 'home',
		loadComponent: () =>
			import('./views/home/home').then((module) => module.HomeView),
	},
    {
        path:'**',
        redirectTo:'home'
    }
];
