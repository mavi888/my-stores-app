import { AmplifySignOut } from '@aws-amplify/ui-react';


function Header(props) {
    return (
        <div className="container">
            <div className="row">
                <div className="col-10">
                    <h1>My Stores WebApp</h1>
                </div>
                <div className="col-2">
                    <AmplifySignOut />
                </div>
            </div>
        </div>
    )
};

export default Header;