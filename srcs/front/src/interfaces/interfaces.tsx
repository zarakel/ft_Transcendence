import React from 'react';

export interface Iprops{
	whatev: any
}

export interface OAuthPopupProps {
    Component?: React.FunctionComponent | React.ReactElement;
}

export interface IOAuth{
    authorizeUrl: string,
    clientId: number,
    redirectUri : string,
    scope?: string
}