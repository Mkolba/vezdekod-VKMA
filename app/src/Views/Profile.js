import React from 'react';

import bridge from "@vkontakte/vk-bridge";

import { View } from '@vkontakte/vkui';
import ProfileMainPanel from "./panels/ProfileMain";
import ProfileAutographEditorPanel from "./panels/ProfileAutographEditor";
import ProfileSettingsPanel from "./panels/ProfileSettings";
import ProfileUserListPanel from "./panels/ProfileUserList";


class ProfileView extends React.Component {
    render() {
        const {go, showPopout, goBack, globState, openModal, activePanels, history} = this.props;

        const lastHistoryObj = history[this.props.id][history[this.props.id].length - 1]
        const swipeBackEnabled = !lastHistoryObj.includes('modal') || !lastHistoryObj.includes('popout');

        return (
            <View id={this.props.id} activePanel={activePanels[this.props.id]} history={history[this.props.id]} onSwipeBack={swipeBackEnabled ? goBack : ()=>{}}>
                <ProfileMainPanel {...this.props} id={'profile_main'}/>
                <ProfileAutographEditorPanel {...this.props} id={'profile_editor'}/>
                <ProfileSettingsPanel {...this.props} id={'profile_settings'}/>
                <ProfileUserListPanel {...this.props} id={'profile_whitelist'}/>
            </View>
        )
    }
}

export default ProfileView;
