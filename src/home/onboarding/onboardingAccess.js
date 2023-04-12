function OnboardingAccess({ onClick }) {
  return (
  	<div class="access">
      <p>Before we continue, we first need to ask you to share your Location and access to your Camera.</p>
      <p>This access will be used so you can look for Echos in your locatoin, and to create an Echo. <u>Nothing else</u>.</p>
      <p><u>We will make it obvious by showing this prompt / icon [insert picture] to let you know when your location or camera is being used.</u></p>
      <p>When you click 'Let's Go' your browser will show a popup asking you to accept. We'll start by searching for Echos in your location.</p>
      <p><button onClick={onClick}>Let's Go - I'm Happy to share my Location and Camera</button></p>
    </div>
  );
}

export default OnboardingAccess;
