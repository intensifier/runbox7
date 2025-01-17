// --------- BEGIN RUNBOX LICENSE ---------
// Copyright (C) 2016-2022 Runbox Solutions AS (runbox.com).
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

import { MessageDisplay } from '../common/messagedisplay';
import { SearchService } from './searchservice';
import { MessageTableRowTool} from '../messagetable/messagetablerow';
import { CanvasTableColumn } from '../canvastable/canvastablecolumn';

export class SearchMessageDisplay extends MessageDisplay {
  private searchService: SearchService;

  // MessageDisplay implementations have different numbers of arguments..
  constructor(...args: any[]) {
    super(args[1]);
    this.searchService = args[0];
  }

  getRowSeen(index: number): boolean {
    return this.searchService.getDocData(this.rows[index][0]).seen ? false : true;
  }

  getRowId(index: number): number {
    return this.rows[index][0];
  }

  getRowMessageId(index: number): number {
    let msgId = 0;
    try {
      msgId = this.searchService.getMessageIdFromDocId(this.rows[index][0]);
    } catch (e) {
      // This shouldnt happen, it means something changed the stored
      // data without updating the messagedisplay rows.
      console.log('Tried to lookup ' + index + ' in searchIndex, isnt there! ' + e);
    }
    return msgId;
  }

  filterBy(options: Map<String, any>) {
  }

  // columns
  // app is a Component (currently)
  public getCanvasTableColumns(app: any): CanvasTableColumn[] {
    const columns: CanvasTableColumn[] = [
      {
        sortColumn: null,
        name: '',
        cacheKey: 'selectbox',
        rowWrapModeHidden: false,
        getValue: (rowIndex): any => this.isSelectedRow(rowIndex),
        checkbox: true
      },
      {
        name: 'Date',
        cacheKey: 'date',
        sortColumn: 2,
        rowWrapModeMuted : true,
        getValue: (rowIndex): string => this.searchService.api.getStringValue(this.getRowId(rowIndex), 2),
        getFormattedValue: (datestring) => MessageTableRowTool.formatTimestampFromStringWithoutSeparators(datestring)
      },
      (app.selectedFolder.indexOf('Sent') === 0 && !app.displayFolderColumn) ? {
        name: 'To',
        cacheKey: 'from',
        sortColumn: null,
        getValue: (rowIndex): string => this.searchService.getDocData(this.getRowId(rowIndex)).recipients.join(', '),
      } :
        {
          name: 'From',
          cacheKey: 'from',
          sortColumn: 0,
          getValue: (rowIndex): string => {
            return this.searchService.getDocData(this.getRowId(rowIndex)).from;
          },
        },
      {
          name: 'Subject',
          cacheKey: 'subject',
          sortColumn: 1,
          getValue: (rowIndex): string => {
            return this.searchService.getDocData(this.getRowId(rowIndex)).subject;
          },
          draggable: true,
          getContentPreviewText: (rowIndex): string => {
            const ret = this.searchService.getDocData(this.getRowId(rowIndex)).textcontent;
            return ret ? ret.trim() : '';
          },
          // tooltipText: 'Tip: Drag subject to a folder to move message(s)'
        }
    ];

    if (app.viewmode === 'conversations') {
      // Array containing row (conversation) objects waiting to be counted
      let currentCountObject = null;

      const processCurrentCountObject = () => {
        // Function for counting messages in a conversation
        const rowObj = currentCountObject;
        const conversationId = this.searchService.api.getStringValue(rowObj[0], 1);
        this.searchService.api.setStringValueRange(1, 'conversation:');
        const conversationSearchText = `conversation:${conversationId}..${conversationId}`;
        const results = this.searchService.api.sortedXapianQuery(
          conversationSearchText,
          1, 0, 0, 1000, 1
        );
        this.searchService.api.clearValueRange();
        rowObj[2] = `${results[0][1] + 1}`;

        currentCountObject = null;
      };

      columns.push(
        {
          name: 'Count',
          cacheKey: 'count',
          sortColumn: null,
          rowWrapModeChipCounter: true,
          getValue: (rowIndex): string => {
            if (!this.getRow(rowIndex)[2]) {
              if (currentCountObject === null) {
                currentCountObject = this.getRow(rowIndex);
                setTimeout(() => processCurrentCountObject(), 0);
              }
              return 'RETRY';
            } else {
              return this.getRow(rowIndex)[2];
            }
          },
          textAlign: 1,
        });
    } else {
      columns.push(
        {
          sortColumn: 3,
          name: 'Size',
          cacheKey: 'size',
          rowWrapModeHidden: true,
          getValue: (rowIndex): string => {
            return  `${this.searchService.api.getNumericValue(this.getRowId(rowIndex), 3)}`;
          },
          getFormattedValue: (val) => val === '-1' ? '\u267B' : MessageTableRowTool.formatBytes(val),
          tooltipText: (rowIndex) => this.searchService.api.getNumericValue(this.getRowId(rowIndex), 3) === -1 ?
            'This message is marked for deletion by an IMAP client' : null
        });

        if (app.displayFolderColumn) {
          columns.push({
            sortColumn: null,
            name: 'Folder',
            cacheKey: 'folder',
            rowWrapModeHidden: true,
            getValue: (rowIndex): string => this.searchService.getDocData(this.getRowId(rowIndex)).folder,
            width: 200
          });
        }

      // Attachment flag column
      columns.push({
        sortColumn: null,
        name: '',
        cacheKey: 'attachment',
        textAlign: 2,
        rowWrapModeHidden: true,
        font: '16px \'Material Icons\'',
        getValue: (rowIndex): boolean => this.searchService.getDocData(this.getRowId(rowIndex)).attachment ? true : false,
        width: 35,
        getFormattedValue: (val) => val ? '\uE226' : ''
      });

      // Answered flag column
      columns.push({
        sortColumn: null,
        name: '',
        cacheKey: 'answered',
        textAlign: 2,
        rowWrapModeHidden: true,
        font: '16px \'Material Icons\'',
        getValue: (rowIndex): boolean => this.searchService.getDocData(this.getRowId(rowIndex)).answered ? true : false,
        width: 35,
        getFormattedValue: (val) => val ? '\uE15E' : ''
      });

      // Flagged flag column
      columns.push({
        sortColumn: null,
        name: '',
        cacheKey: 'flagged',
        textAlign: 2,
        rowWrapModeHidden: true,
        font: '16px \'Material Icons\'',
        getValue: (rowIndex): boolean => this.searchService.getDocData(this.getRowId(rowIndex)).flagged ? true : false,
        width: 35,
        getFormattedValue: (val) => val ? '\uE153' : ''
      });
    }
    return columns;
  }
}
