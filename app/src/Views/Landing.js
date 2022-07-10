import React from 'react';

import bridge from "@vkontakte/vk-bridge";

import LandingMainPanel from "./panels/LandingMain";
import { View } from '@vkontakte/vkui';


class LandingView extends React.Component {
    render() {
        const {go, showPopout, goBack, globState, openModal, activePanels, history} = this.props;

        const lastHistoryObj = history[this.props.id][history[this.props.id].length - 1]
        const swipeBackEnabled = !lastHistoryObj.includes('modal') || !lastHistoryObj.includes('popout');

        return (
            <View id={this.props.id} activePanel={activePanels[this.props.id]} history={history[this.props.id]} onSwipeBack={swipeBackEnabled ? goBack : ()=>{}}>
                <LandingMainPanel {...this.props} id={'landing_main'}/>
            </View>
        )
    }
}

export default LandingView;
