/**
 * Name: MessageBar
 * Description: A Message Bar Component displayed at the top of screen
 * https://github.com/KBLNY/react-native-message-bar
 */
'use strict';

import React, {Component} from 'react'
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  Image,
} from 'react-native';

let windowWidth = Dimensions.get('window').width
let windowHeight = Dimensions.get('window').height


class MessageBar extends Component {

  constructor(props) {
    super(props)

    this.animatedValue = new Animated.Value(0);
    this.notifyAlertHiddenCallback = null;
    this.alertShown = false;
    this.timeoutHide = null;
    this.firstCall = false;

    this.state = this.getStateByProps(props);
  }

  componentDidMount() {
    // Apply the colors of the alert depending on its alertType
    this._applyAlertStylesheet(this.state.alertType);

    // Override the opposition style position regarding the state position in order to have the alert sticks that position
    this._changeOffsetByPosition(this.state.position);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps != null && nextProps.length > 0) {
      this.setNewState(nextProps);
    }
  }

  setNewState(state) {
    // Set the new state, this is triggered when the props of this MessageBar changed
    this.setState(this.getStateByProps(state));

    // Apply the colors of the alert depending on its alertType
    this._applyAlertStylesheet(state.alertType);

    // Override the opposition style position regarding the state position in order to have the alert sticks that position
    this._changeOffsetByPosition(state.position);
  }

  getStateByProps(props) {
    return {
      // Default values, will be overridden
      backgroundColor: '#007bff', // default value : blue
      strokeColor: '#006acd', // default value : blue
      animationTypeTransform: 'SlideFromTop', // default value

      /* Cusomisation of the alert: Title, Message, Icon URL, Alert alertType (error, success, warning, info), Duration for Alert keep shown */
      title: props.title,
      message: props.message,
      avatar: props.avatar,
      alertType: props.alertType || 'info',
      duration: props.duration || 3000,

      /* Hide setters */
      shouldHideAfterDelay: (props.shouldHideAfterDelay == undefined) ? true : props.shouldHideAfterDelay,
      shouldHideOnTap: (props.shouldHideOnTap == undefined) ? true : props.shouldHideOnTap,

      /* Callbacks method on Alert Tapped, on Alert Show, on Alert Hide */
      onTapped: props.onTapped,
      onShow: props.onShow,
      onHide: props.onHide,

      /* Stylesheets */
      stylesheetInfo: props.stylesheetInfo || { backgroundColor: '#007bff', strokeColor: '#006acd' }, // Default are blue colors
      stylesheetSuccess: props.stylesheetSuccess || { backgroundColor: 'darkgreen', strokeColor: '#b40000' }, // Default are Green colors
      stylesheetWarning: props.stylesheetWarning || { backgroundColor: '#ff9c00', strokeColor: '#f29400' }, // Default are orange colors
      stylesheetError: props.stylesheetError || { backgroundColor: '#ff3232', strokeColor: '#FF0000' }, // Default are red colors
      stylesheetExtra: props.stylesheetExtra || { backgroundColor: '#007bff', strokeColor: '#006acd' }, // Default are blue colors, same as info

      /* Duration of the animation */
      durationToShow: props.durationToShow || 350,
      durationToHide: props.durationToHide || 350,

      /* Offset of the View, useful if you have a navigation bar or if you want the alert be shown below another component instead of the top of the screen */
      viewTopOffset: props.viewTopOffset || 0,
      viewBottomOffset: props.viewBottomOffset || 0,
      viewLeftOffset: props.viewLeftOffset || 0,
      viewRightOffset: props.viewRightOffset || 0,

      /* Inset of the view, useful if you want to apply a padding at your alert content */
      viewTopInset: props.viewTopInset || 0,
      viewBottomInset: props.viewBottomInset || 0,
      viewLeftInset: props.viewLeftInset || 0,
      viewRightInset: props.viewRightInset || 0,

      /* Number of Lines for Title and Message */
      titleNumberOfLines: (props.titleNumberOfLines == undefined) ? 1 : props.titleNumberOfLines,
      messageNumberOfLines: (props.messageNumberOfLines == undefined) ? 2 : props.messageNumberOfLines,

      /* Style for the text elements and the avatar */
      titleStyle: props.titleStyle || { color: 'white', fontSize: 18, fontWeight: 'bold' },
      messageStyle: props.messageStyle || { color: 'white', fontSize: 16 },
      avatarStyle: props.avatarStyle || { height: 40, width: 40, borderRadius: 20 },

      /* Position of the alert and Animation Type the alert is shown */
      position: props.position || 'top',
      animationType: props.animationType,
    };
  }


  /*
  * Show the alert
  */
  showMessageBarAlert() {
    // If an alert is already shonw or doesn't have a title or a message, do nothing
    if (this.alertShown || (this.state.title == null && this.state.message == null)) {
      return;
    }

    // Set the data of the alert in the state
    this.alertShown = true;
    this.firstCall = true;

    // Display the alert by animating it from the top of the screen
    // Auto-Hide it after a delay set in the state
    Animated.timing(this.animatedValue, {
      toValue: 1,
      duration: this.state.durationToShow
    }).start(this._showMessageBarAlertComplete());
  }


  /*
  * Hide the alert after a delay, typically used for auto-hidding
  */
  _showMessageBarAlertComplete() {
    // Execute onShow callback if any
    this._onShow();

    // If the duration is null, do not hide the
    if (this.state.shouldHideAfterDelay) {
      this.timeoutHide = setTimeout(() => {
        this.hideMessageBarAlert();
      }, this.state.duration);
    }
  }


  /*
  * Return true if the MessageBar is currently displayed, otherwise false
  */
  isMessageBarShown() {
    return this.alertShown;
  }


  /*
  * Hide the alert, typically used when user tap the alert
  */
  hideMessageBarAlert() {
    // Hide the alert after a delay set in the state only if the alert is still visible
    if (!this.alertShown) {
      return;
    }

    clearTimeout(this.timeoutHide);

    // Animate the alert to hide it to the top of the screen
    Animated.timing(this.animatedValue, {
      toValue: 0,
      duration: this.state.durationToHide
    }).start(this._hideMessageBarAlertComplete());
  }


  _hideMessageBarAlertComplete() {
    // The alert is not shown anymore
    this.alertShown = false;

    this._notifyAlertHidden();

    // Execute onHide callback if any
    this._onHide();
  }

  /*
  * Callback executed to tell the observer the alert is hidden
  */
  _notifyAlertHidden() {
    if (this.notifyAlertHiddenCallback) {
      this.notifyAlertHiddenCallback();
    }
  }


  /*
  * Callback executed when the user tap the alert
  */
  _alertTapped() {
    // Hide the alert
    if (this.state.shouldHideOnTap) {
      this.hideMessageBarAlert();
    }

    // Execute the callback passed in parameter
    if (this.state.onTapped) {
      this.state.onTapped();
    }
  }


  /*
  * Callback executed when alert is shown
  */
  _onShow() {
    if (this.state.onShow) {
      this.state.onShow();
    }
  }


  /*
  * Callback executed when alert is hidden
  */
  _onHide() {
    if (this.state.onHide) {
      this.state.onHide();
    }
  }


  /*
  * Change the background color and the line stroke color depending on the alertType
  * If the alertType is not recognized, the 'info' one (blue colors) is selected for you
  */
  _applyAlertStylesheet(alertType) {
    // Set the Background color and the line stroke color of the alert depending on its alertType
    // Set to blue-info if no alertType or if the alertType is not recognized

    let backgroundColor;
    let strokeColor;

    switch (alertType) {
      case 'success':
        backgroundColor = this.state.stylesheetSuccess.backgroundColor;
        strokeColor = this.state.stylesheetSuccess.strokeColor;
        break;
      case 'error':
        backgroundColor = this.state.stylesheetError.backgroundColor;
        strokeColor = this.state.stylesheetError.strokeColor;
        break;
      case 'warning':
        backgroundColor = this.state.stylesheetWarning.backgroundColor;
        strokeColor = this.state.stylesheetWarning.strokeColor;
        break;
      case 'info':
        backgroundColor = this.state.stylesheetInfo.backgroundColor;
        strokeColor = this.state.stylesheetInfo.strokeColor;
        break;
      default:
        backgroundColor = this.state.stylesheetExtra.backgroundColor;
        strokeColor = this.state.stylesheetExtra.strokeColor;
        break;
    }

    this.setState({
      backgroundColor: backgroundColor,
      strokeColor: strokeColor
    });
  }


  /*
  * Change view<Position>Offset property depending on the state position
  */
  _changeOffsetByPosition(position) {
    switch (position) {
      case 'top':
        this.setState({
          viewBottomOffset: null
        });
        break;
      case 'bottom':
        this.setState({
          viewTopOffset: null
        });
        break;
      default:
        this.setState({
          viewBottomOffset: null
        });
        break;
    }
  }


  /*
  * Set the animation transformation depending on the chosen animationType, or depending on the state's position if animationType is not overridden
  */
  _apllyAnimationTypeTransformation() {
    let position = this.state.position;
    let animationType = this.state.animationType;

    if (animationType === undefined) {
      if (position === 'bottom') {
        animationType = 'SlideFromBottom';
      } else {
        // Top by default
        animationType = 'SlideFromTop';
      }
    }

    switch (animationType) {
      case 'SlideFromTop':
         var animationY = this.animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-windowHeight, 0]
        });
        this.animationTypeTransform = [{ translateY: animationY }];
        break;
      case 'SlideFromBottom':
         var animationY = this.animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [windowHeight, 0]
        });
        this.animationTypeTransform = [{ translateY: animationY }];
        break;
      case 'SlideFromLeft':
         var animationX = this.animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-windowWidth, 0]
        });
        this.animationTypeTransform = [{ translateX: animationX }];
        break;
      case 'SlideFromRight':
         var animationX = this.animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [windowWidth, 0]
        });
        this.animationTypeTransform = [{ translateX: animationX }];
        break;
      default:
         var animationY = this.animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [-windowHeight, 0]
        });
        this.animationTypeTransform = [{ translateY: animationY }];
        break;
    }
  }


  /*
  * Alert Rendering Methods
  */

  render() {
    // Set the animation transformation depending on the chosen animationType, or depending on the state's position if animationType is not overridden
    this._apllyAnimationTypeTransformation();

    if (this.firstCall){
      return (
        <Animated.View style={{ transform: this.animationTypeTransform, backgroundColor: this.state.backgroundColor, borderColor: this.state.strokeColor, borderBottomWidth: 1, position: 'absolute', top: this.state.viewTopOffset, bottom: this.state.viewBottomOffset, left: this.state.viewLeftOffset, right: this.state.viewRightOffset, paddingTop: this.state.viewTopInset, paddingBottom: this.state.viewBottomInset, paddingLeft: this.state.viewLeftInset, paddingRight: this.state.viewRightInset }}>
          <TouchableOpacity onPress={()=>{this._alertTapped()}} style={{ flex: 1 }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'flex-end', margin: 10 }} >
              { this.renderImage() }
              <View style={{ flex: 1, flexDirection: 'column', alignSelf: 'stretch', justifyContent: 'center', marginLeft: 10, marginRight: 10 }} >
                { this.renderTitle() }
                { this.renderMessage() }
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      );
    } else {
      return (<View/>);
    }
  }

  renderImage() {
    if (this.state.avatar != null) {
      var imageSource;
      let uri = this.state.avatar;
      if (!!(typeof uri === 'string' && uri.match(/^https?:/))) {
        // this is a network file
        imageSource = { uri: this.state.avatar }
      } else {
        // this is a local file : require('<path/to/my/local/image.extension>')
        imageSource = this.state.avatar
      }

      return (
        <Image source={imageSource} style={this.state.avatarStyle} />
      );
    }
  }

  renderTitle() {
    if (this.state.title != null) {
      return (
        <Text numberOfLines={this.state.titleNumberOfLines} style={this.state.titleStyle}>
          { this.state.title }
        </Text>
      );
    }
  }

  renderMessage() {
    if (this.state.message != null) {
      return (
        <Text numberOfLines={this.state.messageNumberOfLines} style={this.state.messageStyle}>
          { this.state.message }
        </Text>
      );
    }
  }

}

module.exports = MessageBar;
