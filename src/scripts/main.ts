// import in order of site usage to minimize loading time
import '../stylesheets/style.css';
import './api';
import './router';
import './theme';
import './search';
import './audioEvents';
import './library';
import './superModal';
import './queue';
import './miscEvents';
import '../components/streamItem';
import '../components/listItem';
import '../components/toggleSwitch';
import { enqueueBtn, listContainer, openInYtBtn, playAllBtn, saveListBtn } from '../lib/dom';
import { clearQ, firstItemInQueue, listToQ } from './queue';
import { addListToCollection, createPlaylist } from './library';
import { registerSW } from 'virtual:pwa-register';

const update = registerSW({
  async onNeedRefresh() {
    const data = await fetch('https://api.github.com/repos/owencz1998/vibesound/commits/6.5').then(_ => _.json());
    const displayer = <HTMLDialogElement>document.getElementById('changelog');
    const [updateBtn, laterBtn] = <HTMLCollectionOf<HTMLButtonElement>>displayer.lastElementChild?.children;
    displayer.children[1].textContent = data.commit.message;
    const commits = await fetch('https://api.github.com/repos/owencz1998/vibesound/commits')
      .then(_ => _.json());

    commits.map((e: { commit: string }) => e.commit).map((e: { committer: { date: string }, message: string }) => e.committer.date + ' : ' + e.message).forEach((e: string) => {
      displayer.children[1].textContent += e;
    })

    displayer.showModal();
    displayer.onclick = _ => _.stopPropagation();
    updateBtn.onclick = () => update();
    updateBtn.focus();
    laterBtn.onclick = () => displayer.close();
  }
});


// list tools functions

playAllBtn.addEventListener('click', () => {
  clearQ();
  listToQ(listContainer);
  firstItemInQueue().click();
});

enqueueBtn.onclick = () => listToQ(listContainer);

saveListBtn.addEventListener('click', () => {
  if (saveListBtn.textContent === ' Subscribe') {
    alert('This has not been implemented yet.');
    saveListBtn.innerHTML = '<i class="ri-stack-line"></i> Subscribed';
    return;
  }

  const listTitle = prompt('Set Title', <string>openInYtBtn.textContent?.substring(1));

  if (!listTitle) return;

  createPlaylist(listTitle);

  const list: { [index: string]: DOMStringMap } = {};
  listContainer.childNodes.forEach(_ => {
    const sender = (<HTMLElement>_).dataset;
    const id = <string>sender.id;
    list[id] = {};
    ['id', 'title', 'author', 'duration', 'thumbnail', 'channelUrl']
      .forEach($ => list[id][$] = sender[$]);
  });
  addListToCollection(listTitle, list);
  saveListBtn.innerHTML = '<i class="ri-stack-line"></i> Saved';
});

openInYtBtn.onclick = () => open('https://youtube.com' + listContainer.dataset.url);
