// here we will define colors for light and dark themes

export const AuthColors = {
    light: {
        authContainer: { // auth page
            position: 'relative',
            alignItems: 'center',
            borderWidth: 3,
            borderRadius: 20,
            borderColor: '#A1D35D',
            width: '80%'
        },
        authContainerOverlay: {
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#204C03',
            opacity: 0.5,
            zIndex: -1
        },
        authTitle: {
            fontSize: 29,
            fontWeight: 'bold',
            color: 'white'
        },
        authInput: {
            borderWidth: 2,
            borderRadius: 6,
            borderColor: '#A9D355',
            padding: 7,
            color: 'white',
            width: '80%',
            fontSize: 16,
            fontWeight: 600
        },
        authButton: {
            alignItems: 'center',
            width: '50%',
            padding: 5,
            borderWidth: 2,
            borderRadius: 20,
            backgroundColor: '#73991A',
            borderColor: '#528C0A',
            opacity: 0.8
        },
        authButtonPressed: {
            alignItems: 'center',
            width: '50%',
            padding: 5,
            borderWidth: 2,
            borderRadius: 20,
            backgroundColor: '#325702',
            borderColor: '#528C0A',
            opacity: 1
        },
        authButtonText: {
            fontSize: 16,
            fontWeight: 800,
            color: 'white'
        },
        mainButton: { // Main page

        }

    },
    dark: {
        container: {
            
        }
    }
}

