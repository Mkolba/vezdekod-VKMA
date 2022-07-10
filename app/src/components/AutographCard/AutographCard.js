import React from 'react';

import {
    Button, Group, Card, Tappable, Link, Spinner, CellButton,
    Panel, PanelHeader, Placeholder, PullToRefresh
} from '@vkontakte/vkui';

import {
    Icon16User, Icon24DeleteOutline, Icon24StoryOutline
} from "@vkontakte/icons";

import IconUser from '../../img/iconUser.png'
import {url} from "../../api";
import './AutographCard.scss'


const AutographCard = (props) => {
    return (
        <Card mode={'shadow'} className={'AutographCard'} id={props.id}>
            <Tappable className={'Wrapper'} onClick={props.onClick} disabled={props.disabled}>
                <div className={'Content'}>
                    {
                        props.image &&
                        <div className={'Image'}>
                            <img src={url + 'images/' + props.image + '.jpg'} alt={''}/>
                            <div className={'Gradient'}/>
                        </div>
                    }
                    {
                        props.text &&
                        <div className={'Text' + (!props.image ? ' no-image' : '')}>
                            {props.text}
                        </div>
                    }
                    <div className={'Sign'}>
                        <Link href={`https://vk.com/id${props.from_id}`} target={'_blank'} onClick={e => e.stopPropagation()}>
                            <img src={IconUser} alt={''} style={{width: 16, height: 16, padding: '0 6px'}}/> {props.name}
                        </Link>
                    </div>
                </div>
            </Tappable>
        </Card>
    )
}

export default AutographCard;
