const formData = new FormData();
const input = document.querySelector('.inputMult');

input.addEventListener('change', async () => {
  Object.values(input.files).forEach((file) => formData.append('file', file));
  await axios({
    method: 'post',
    url: 'http://localhost:4000/routes?clearPast=true',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
});
