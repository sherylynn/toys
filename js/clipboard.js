javascript: (function() {
  function getLiveUrl(cfg) {
    let liveInfo = cfg.stream.data[0].gameStreamInfoList;
    let urls = ["请选择一个地址，复制粘贴至 IINA 等播放器："];
    for (let item of liveInfo) {
      let liveUrl = `${item.sHlsUrl}/${item.sStreamName}.m3u8`;
      urls.push(liveUrl);
    }
    alert(urls.join('\n\n\n'));
  }
  getLiveUrl(hyPlayerConfig);
  let data = new Blob(["Text data"], {type : "text/plain"});
  navigator.clipboard.write(data).then(function() {
    console.log("Copied to clipboard successfully!");
  }, function() {
    console.error("Unable to write to clipboard. :-(");
  });
})()
