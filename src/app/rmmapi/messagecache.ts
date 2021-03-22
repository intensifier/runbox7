// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2021 Runbox Solutions AS (runbox.com).
// 
// This file is part of Runbox 7.
// 
// Runbox 7 is free software: You can redistribute it and/or modify it
// under the terms of the GNU General Public License as published by the
// Free Software Foundation, either version 3 of the License, or (at your
// option) any later version.
// 
// Runbox 7 is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
// General Public License for more details.
// 
// You should have received a copy of the GNU General Public License
// along with Runbox 7. If not, see <https://www.gnu.org/licenses/>.
// ---------- END RUNBOX LICENSE ----------

import { Injectable } from '@angular/core';
import { Dexie } from 'dexie';
import { MessageContents } from './rbwebmail';

@Injectable()
export class MessageCache {
    db: Dexie;

    constructor() {
        this.db = new Dexie('messageCache');
        this.db.version(2).stores({
            messages: '', // use out-of-line keys
        });
    }

    async get(id: number): Promise<MessageContents> {
        return this.db.table('messages').get(id);
    }

    set(id: number, contents: MessageContents): void {
        this.db.table('messages').put(contents, id);
    }

    delete(id: number): void {
        this.db.table('messages').delete(id);
    }
}