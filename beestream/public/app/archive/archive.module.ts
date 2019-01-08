import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ShareModule } from '@ngx-share/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButtonModule } from '@angular/material/button';

import { ArchiveRoutes } from './archive.routes';
import { ArchiveComponent } from './archive.component';
import { VideoService } from '../video/video.service'
import { CommentModule } from '../comment/comment.module';
import { TagModule } from '../tag/tag.module';
import { AnalysisModule } from '../analysis/analysis.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    CommentModule,
    TagModule,
    AnalysisModule,
    HttpClientModule,
    FontAwesomeModule,
    MatButtonModule,
    ShareModule,
    RouterModule.forChild(ArchiveRoutes)
  ],
  declarations: [
    ArchiveComponent
  ],
  providers: [
    VideoService
  ]
})
export class ArchiveModule {}
