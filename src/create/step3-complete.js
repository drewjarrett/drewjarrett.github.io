function Step3Complete({ handleFinish }) {
  return (
    <div class="step">
      <p>You Did it. Your Echo is out there in the virtual world for others to find. Congratulations.</p>
      <button onClick={handleFinish}>Yay. Finish</button>
    </div>
  );
}

export default Step3Complete;
