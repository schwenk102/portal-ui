import React from 'react';
import Typography from '@material-ui/core/Typography';

import { StyledDivider } from './style';
import ProvTabs from '../ProvTabs';
import Summary from '../Summary';
import Attribution from '../Attribution';
import Protocol from '../Protocol';
import MetadataTable from '../MetadataTable';
import Visualization from '../Visualization';
import DetailLayout from '../DetailLayout';
import Files from '../Files';

// TODO use this context for components other than FileBrowser
import DetailContext from '../context';

function AssaySpecificItem(props) {
  const { children } = props;
  return (
    <>
      <Typography variant="body1">{children}</Typography>
      <StyledDivider orientation="vertical" flexItem />
    </>
  );
}

function SummaryData(props) {
  const { data_types, mapped_data_types, origin_sample } = props;

  // TODO: This was an array, but in production it's a single value.
  // Simplify when it's single valued in all environments.

  // NOTE: This is the one place we use unmapped values,
  // because they are better than human-readable strings as URL fragments.

  const typeCodes = Array.isArray(data_types) ? data_types : [data_types];
  const typeNames = Array.isArray(mapped_data_types) ? mapped_data_types : [mapped_data_types];
  const codesNames = typeCodes.map((code, i) => {
    return { code, name: typeNames[i] };
  });
  return (
    <>
      <AssaySpecificItem>
        {codesNames.map(({ code, name }, i) => [i > 0 && ' / ', <a href={`/docs/assays#${code}`}>{name}</a>])}
      </AssaySpecificItem>
      <Typography variant="body1">{origin_sample.mapped_organ}</Typography>
    </>
  );
}

function DatasetDetail(props) {
  const { assayMetadata, vitData, assetsEndpoint, elasticsearchEndpoint, entityEndpoint } = props;
  const {
    protocol_url,
    portal_uploaded_protocol_files,
    metadata,
    files,
    uuid,
    data_types,
    mapped_data_types,
    origin_sample,
    group_name,
    created_by_user_displayname,
    created_by_user_email,
    display_doi,
    entity_type,
    create_timestamp,
    last_modified_timestamp,
    description,
    status,
  } = assayMetadata;

  const shouldDisplaySection = {
    visualization: 'name' in vitData || (vitData[0] && 'name' in vitData[0]),
    protocols: Boolean(portal_uploaded_protocol_files || protocol_url),
    metadataTable: metadata && 'metadata' in metadata,
    files: true,
  };

  // TODO: When all environments are clean, data_types array fallbacks shouldn't be needed.
  return (
    <DetailContext.Provider value={{ assetsEndpoint, elasticsearchEndpoint, display_doi, uuid }}>
      <DetailLayout shouldDisplaySection={shouldDisplaySection}>
        <Summary
          uuid={uuid}
          entity_type={entity_type}
          display_doi={display_doi}
          create_timestamp={create_timestamp}
          last_modified_timestamp={last_modified_timestamp}
          description={description}
          status={status}
        >
          <SummaryData
            data_types={data_types || []}
            mapped_data_types={mapped_data_types || []}
            origin_sample={origin_sample}
          />
        </Summary>
        {shouldDisplaySection.visualization && <Visualization vitData={vitData} />}
        <Attribution
          group_name={group_name}
          created_by_user_displayname={created_by_user_displayname}
          created_by_user_email={created_by_user_email}
        />
        <ProvTabs uuid={uuid} assayMetadata={assayMetadata} entityEndpoint={entityEndpoint} />
        {shouldDisplaySection.protocols && (
          <Protocol protocol_url={protocol_url} portal_uploaded_protocol_files={portal_uploaded_protocol_files} />
        )}
        {shouldDisplaySection.metadataTable && <MetadataTable metadata={metadata.metadata} display_doi={display_doi} />}
        <Files files={files} entityEndpoint={entityEndpoint} uuid={uuid} />
      </DetailLayout>
    </DetailContext.Provider>
  );
}

export default DatasetDetail;
